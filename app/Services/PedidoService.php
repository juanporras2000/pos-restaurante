<?php
namespace App\Services;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Producto;
use App\Models\Insumo;
use App\Models\MovimientoInventario;
use App\Models\Configuracion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;

class PedidoService
{
    /**
     * Actualiza un pedido revirtiendo el stock anterior y aplicando el nuevo consumo.
     *
     * @param Pedido $pedido
     * @param array $datos
     * @return Pedido
     * @throws ValidationException|\Exception
     */
    public function actualizarPedido(Pedido $pedido, array $datos): Pedido
    {
        return DB::transaction(function () use ($pedido, $datos) {

            // 1. REVERTIR STOCK DE LOS INSUMOS ACTUALES
            $this->revertirStockInsumos($pedido);

            // 2. CALCULAR Y VALIDAR STOCK DE LOS NUEVOS PRODUCTOS
            $procesado = $this->calcularYValidarNuevoStock($datos['productos']);
            $nuevoConsumo        = $procesado['nuevoConsumo'];
            $nuevosProductosData = $procesado['nuevosProductosData'];

            // 3. ELIMINAR DETALLES VIEJOS Y CREAR LOS NUEVOS
            $pedido->detalles()->delete();
            $total = $this->crearNuevosDetalles($pedido->id, $nuevosProductosData);

            // 4. DESCONTAR EL NUEVO STOCK DE INSUMOS
            $this->descontarNuevoStock($pedido->id, $nuevoConsumo);

            // 5. ACTUALIZAR CABECERA DEL PEDIDO
            $pedido->update([
                'tipo'           => $datos['tipo'],
                'numero_mesa'    => $datos['numero_mesa'] ?? null,
                'direccion'      => $datos['direccion'] ?? null,
                'nombre_cliente' => $datos['nombre_cliente'] ?? null,
                'total'          => $total,
            ]);

            // Aplicar recargo de domicilio si corresponde
            if ($pedido->tipo === 'domicilio') {
                $recargo = (float) Configuracion::get('recargo_domicilio', 0);
                if ($recargo > 0) {
                    $pedido->increment('total', $recargo);
                }
            }

            return $pedido;
        });
    }

    /**
     * Devuelve al inventario los insumos del estado previo del pedido.
     */
    protected function revertirStockInsumos(Pedido $pedido): void
    {
        $pedido->load('detalles.producto.insumos');
        $insumosADevolver = [];

        foreach ($pedido->detalles as $detalle) {
            $producto = $detalle->producto;
            if ($producto) {
                foreach ($producto->insumos as $insumo) {
                    $idInsumo = $insumo->id;
                    $cantidadRequerida = $insumo->pivot->cantidad * $detalle->cantidad;
                    $insumosADevolver[$idInsumo] = ($insumosADevolver[$idInsumo] ?? 0) + $cantidadRequerida;
                }
            }
        }

        if (!empty($insumosADevolver)) {
            $insumosBloqueadosViejos = Insumo::whereIn('id', array_keys($insumosADevolver))->lockForUpdate()->get()->keyBy('id');

            foreach ($insumosADevolver as $insumoId => $cantidad) {
                $insumo = $insumosBloqueadosViejos->get($insumoId);
                if (!$insumo) continue;

                $stockAntes = $insumo->stock_actual;
                $insumo->increment('stock_actual', $cantidad);
                $insumo->refresh();

                MovimientoInventario::create([
                    'insumo_id'     => $insumoId,
                    'user_id'       => Auth::id(),
                    'pedido_id'     => $pedido->id,
                    'tipo'          => 'entrada',
                    'cantidad'      => $cantidad,
                    'stock_antes'   => $stockAntes,
                    'stock_despues' => $insumo->stock_actual,
                    'motivo'        => "Edición (Devolución) - Pedido #{$pedido->id}",
                ]);
            }
        }
    }

    /**
     * Mapea el nuevo payload de productos y valida si hay stock físico real disponible.
     */
    protected function calcularYValidarNuevoStock(array $productosPayload): array
    {
        $nuevoConsumo = [];
        $nuevosProductosData = [];

        foreach ($productosPayload as $item) {
            $producto = Producto::with('insumos')->findOrFail($item['producto_id']);
            $nuevosProductosData[] = [
                'producto'    => $producto,
                'cantidad'    => $item['cantidad'],
                'observacion' => $item['observacion'] ?? null,
                'adiciones'   => $item['adiciones'] ?? []
            ];

            foreach ($producto->insumos as $insumo) {
                $idInsumo = $insumo->id;
                $necesario = $insumo->pivot->cantidad * $item['cantidad'];
                $nuevoConsumo[$idInsumo] = ($nuevoConsumo[$idInsumo] ?? 0) + $necesario;
            }
        }

        if (!empty($nuevoConsumo)) {
            $insumosBloqueadosNuevos = Insumo::whereIn('id', array_keys($nuevoConsumo))->lockForUpdate()->get()->keyBy('id');
            $faltantes = [];

            foreach ($nuevoConsumo as $insumoId => $necesario) {
                $ins = $insumosBloqueadosNuevos->get($insumoId);
                if ($ins && $ins->stock_actual < $necesario) {
                    $faltantes[] = "{$ins->nombre}: necesario {$necesario} {$ins->unidad_medida}, disponible {$ins->stock_actual} {$ins->unidad_medida}";
                }
            }

            if (!empty($faltantes)) {
                throw new ValidationException(
                    Validator::make([], []),
                    response()->json(['error' => 'Stock insuficiente para la actualización', 'faltantes' => $faltantes], 422)
                );
            }
        }

        return [
            'nuevoConsumo' => $nuevoConsumo,
            'nuevosProductosData' => $nuevosProductosData
        ];
    }

    /**
     * Registra las líneas de detalle del pedido y retorna el subtotal acumulado.
     */
    protected function crearNuevosDetalles(int $pedidoId, array $nuevosProductosData): float
    {
        $totalAcumulado = 0;

        foreach ($nuevosProductosData as $item) {
            $producto = $item['producto'];
            $subtotal = $producto->precio * $item['cantidad'];

            $adicionesData = [];
            foreach ($item['adiciones'] ?? [] as $adic) {
                $adicSubtotal = floatval($adic['precio']) * intval($adic['cantidad']);
                $subtotal += $adicSubtotal;
                $adicionesData[] = [
                    'adicion_id' => $adic['adicion_id'],
                    'nombre'     => $adic['nombre'],
                    'precio'     => floatval($adic['precio']),
                    'cantidad'   => intval($adic['cantidad']),
                    'subtotal'   => $adicSubtotal,
                ];
            }

            PedidoDetalle::create([
                'pedido_id'       => $pedidoId,
                'producto_id'     => $producto->id,
                'cantidad'        => $item['cantidad'],
                'precio_unitario' => $producto->precio,
                'subtotal'        => $subtotal,
                'observacion'     => $item['observacion'],
                'adiciones'       => !empty($adicionesData) ? $adicionesData : null,
            ]);

            $totalAcumulado += $subtotal;
        }

        return $totalAcumulado;
    }

    /**
     * Ejecuta el decremento del inventario para los nuevos insumos requeridos.
     */
    protected function descontarNuevoStock(int $pedidoId, array $nuevoConsumo): void
    {
        foreach ($nuevoConsumo as $insumoId => $cantidad) {
            $insumo = Insumo::find($insumoId);
            if (!$insumo) continue;

            $stockAntes = $insumo->stock_actual;
            $insumo->decrement('stock_actual', $cantidad);
            $insumo->refresh();

            MovimientoInventario::create([
                'insumo_id'     => $insumoId,
                'user_id'       => Auth::id(),
                'pedido_id'     => $pedidoId,
                'tipo'          => 'salida',
                'cantidad'      => $cantidad,
                'stock_antes'   => $stockAntes,
                'stock_despues' => $insumo->stock_actual,
                'motivo'        => "Edición (Nuevo Consumo) - Pedido #{$pedidoId}",
            ]);
        }
    }

    public function eliminarPedido(Pedido $pedido, string $razonEliminacion): void
    {
        DB::transaction(function () use ($pedido, $razonEliminacion) {

            // 1. Reutilizamos el método existente para cargar relaciones, bloquear filas y sumar al stock
            $pedido->load('detalles.producto.insumos');
            $insumosADevolver = [];

            foreach ($pedido->detalles as $detalle) {
                $producto = $detalle->producto;
                if ($producto) {
                    foreach ($producto->insumos as $insumo) {
                        $idInsumo = $insumo->id;
                        $cantidadRequerida = $insumo->pivot->cantidad * $detalle->cantidad;
                        $insumosADevolver[$idInsumo] = ($insumosADevolver[$idInsumo] ?? 0) + $cantidadRequerida;
                    }
                }
            }

            if (!empty($insumosADevolver)) {
                $insumosBloqueados = Insumo::whereIn('id', array_keys($insumosADevolver))->lockForUpdate()->get()->keyBy('id');

                foreach ($insumosADevolver as $insumoId => $cantidad) {
                    $insumo = $insumosBloqueados->get($insumoId);
                    if (!$insumo) continue;

                    $stockAntes = $insumo->stock_actual;
                    $insumo->increment('stock_actual', $cantidad);
                    $insumo->refresh();

                    // Registrar la reversión con el motivo de cancelación personalizado
                    MovimientoInventario::create([
                        'insumo_id'     => $insumoId,
                        'user_id'       => Auth::id(),
                        'pedido_id'     => $pedido->id,
                        'tipo'          => 'entrada',
                        'cantidad'      => $cantidad,
                        'stock_antes'   => $stockAntes,
                        'stock_despues' => $insumo->stock_actual,
                        'motivo'        => "Cancelación - Pedido #{$pedido->id}. Motivo: {$razonEliminacion}",
                    ]);
                }
            }

            // 2. Aplicar el borrado lógico del pedido
            $pedido->update(['razon_eliminacion' => $razonEliminacion]);
            $pedido->delete();
        });
    }

    public function crearPedido(array $datos): Pedido
    {
        return DB::transaction(function () use ($datos) {

            // 1. CALCULAR Y VALIDAR STOCK DISPONIBLE (Reutiliza el método de actualización)
            $procesado = $this->calcularYValidarNuevoStock($datos['productos']);
            $nuevoConsumo        = $procesado['nuevoConsumo'];
            $nuevosProductosData = $procesado['nuevosProductosData'];

            // 2. CREAR LA CABECERA DEL PEDIDO
            $pedido = Pedido::create([
                'user_id'        => Auth::id(),
                'tipo'           => $datos['tipo'],
                'numero_mesa'    => $datos['numero_mesa'] ?? null,
                'direccion'      => $datos['direccion'] ?? null,
                'nombre_cliente' => $datos['nombre_cliente'] ?? null,
                'total'          => 0,
                'id_perfil'      => $datos['id_perfil'],
            ]);

            // 3. REGISTRAR LOS DETALLES DEL PEDIDO Y OBTENER EL TOTAL
            $total = $this->crearNuevosDetalles($pedido->id, $nuevosProductosData);
            $pedido->update(['total' => $total]);

            // 4. APLICAR RECARGO POR DOMICILIO SI CORRESPONDE
            if ($pedido->tipo === 'domicilio') {
                $recargo = (float) Configuracion::get('recargo_domicilio', 0);
                if ($recargo > 0) {
                    $pedido->increment('total', $recargo);
                }
            }

            // 5. DESCONTAR EL STOCK DE INSUMOS (Reutiliza la lógica de salida de almacén)
            // Cambiamos el motivo a "Venta" dinámicamente o sobrescribiendo el método
            $this->descontarStockPorVenta($pedido->id, $nuevoConsumo);

            // 6. EMITIR EL EVENTO BROADCAST EN TIEMPO REAL
            broadcast(new \App\Events\PedidoCreado($pedido))->toOthers();

            return $pedido;
        });
    }

    protected function descontarStockPorVenta(int $pedidoId, array $nuevoConsumo): void
    {
        foreach ($nuevoConsumo as $insumoId => $cantidad) {
            $insumo = Insumo::find($insumoId);
            if (!$insumo) continue;

            $stockAntes = $insumo->stock_actual;
            $insumo->decrement('stock_actual', $cantidad);
            $insumo->refresh();

            MovimientoInventario::create([
                'insumo_id'     => $insumoId,
                'user_id'       => Auth::id(),
                'pedido_id'     => $pedidoId,
                'tipo'          => 'salida',
                'cantidad'      => $cantidad,
                'stock_antes'   => $stockAntes,
                'stock_despues' => $insumo->stock_actual,
                'motivo'        => "Venta - Pedido #{$pedidoId}",
            ]);
        }
    }
}
