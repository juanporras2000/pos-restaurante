<?php

namespace App\Services;

use App\Models\Producto;
use App\Models\Conversacion;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PedidoIAService
{
    /**
     * Recibe el intent estructurado y ejecuta la lÃ³gica de negocio.
     * Retorna un array de contexto para que la IA genere la respuesta final.
     */
    public function procesarIntent(array $intent, string $telefono, string $mensajeOriginal = ''): array
    {
        // Obtener el registro de estado de este cliente (1 por telÃ©fono)
        $estado = $this->obtenerEstadoCliente($telefono);
        $iaService = app(\App\Services\IAService::class);
        
        // Decidir acción de negocio final basándose en el lenguaje natural (Paso 1.2)
        $accionNegocio = $iaService->decidirAccionNegocio($mensajeOriginal, $estado->carrito);

        Log::info('PedidoIAService - Negocio:', [
            'telefono'        => $telefono,
            'intent'          => $intent['intent'],
            'accion_ia'       => $intent['accion'],
            'accion_negocio'  => $accionNegocio,
            'pedido_activo_id' => $estado->pedido_activo_id,
        ]);

        try {
            switch ($intent['intent']) {
                case 'saludo':
                    return ['estado' => 'saludo', 'carrito' => $this->carritoActual($estado)];

                case 'pedido':
                    // Usar la acción de negocio decidida por la IA
                    if ($accionNegocio === 'limpiar') {
                        return $this->reemplazarCarrito($estado, $intent);
                    } elseif ($accionNegocio === 'confirmar') {
                        return $this->confirmarPedidoActivo($estado, $intent['direccion']);
                    }
                    return $this->procesarSegunAccion($estado, $intent);

                case 'confirmacion':
                case 'direccion':
                    // Si manda productos junto con la dirección/confirmación, procésalos según la acción (agregar/reemplazar/eliminar)
                    if (!empty($intent['productos'])) {
                        $r = $this->procesarSegunAccion($estado, $intent);
                        if ($r['estado'] === 'producto_no_encontrado') {
                            return $r;
                        }
                        // Recargar estado actualizado
                        $estado->refresh();
                    }
                    
                    // Si el intent es dirección (o viene dirección en el JSON), se intenta confirmar
                    // También si la acción es confirmar explícitamente.
                    if ($intent['intent'] === 'direccion' || !empty($intent['direccion']) || $intent['accion'] === 'confirmar') {
                        return $this->confirmarPedidoActivo($estado, $intent['direccion']);
                    }

                    return ['estado' => 'seleccionando', 'carrito' => $this->carritoActual($estado)];

                case 'cancelacion':
                    return $this->cancelarPedidoActivo($estado);

                default:
                    return [
                        'estado'          => 'consulta',
                        'carrito'         => $this->carritoActual($estado),
                        'mensaje_sistema' => 'Â¿En quÃ© te puedo ayudar?',
                    ];
            }
        } catch (\Exception $e) {
            Log::error('Error en PedidoIAService@procesarIntent: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return ['estado' => 'error', 'carrito' => $this->carritoActual($estado)];
        }
    }

    // =========================================================================
    // Estado del cliente (1 registro por telÃ©fono, siempre el mismo)
    // =========================================================================

    protected function obtenerEstadoCliente(string $telefono): Conversacion
    {
        // Busca el registro de "estado" (sin mensaje, solo estado del cliente)
        $estado = Conversacion::where('telefono', $telefono)
            ->whereNull('mensaje') // El registro de estado no tiene mensaje
            ->first();

        if (!$estado) {
            $estado = Conversacion::create([
                'telefono' => $telefono,
                'mensaje'  => null,
                'respuesta' => null,
                'estado'   => 'nuevo',
                'carrito'  => ['productos' => [], 'total' => 0],
                'pedido_activo_id' => null,
            ]);
        }

        return $estado;
    }

    protected function carritoActual(Conversacion $estado): array
    {
        return $estado->carrito ?? ['productos' => [], 'total' => 0];
    }

    // =========================================================================
    // Enrutador de acciones (agregar / reemplazar / eliminar)
    // =========================================================================

    protected function procesarSegunAccion(Conversacion $state, array $intent): array
    {
        $accion = $intent['accion'] ?? 'agregar';

        switch ($accion) {
            case 'limpiar':
                return $this->reemplazarCarrito($state, $intent);

            case 'eliminar':
                return $this->eliminarProductos($state, $intent);

            case 'confirmar':
                return $this->confirmarPedidoActivo($state, $intent['direccion']);

            case 'agregar':
            case 'mantener':
            default:
                return $this->agregarProductos($state, $intent);
        }
    }

    // =========================================================================
    // Operaciones de carrito
    // =========================================================================

    protected function agregarProductos(Conversacion $state, array $intent): array
    {
        $carrito = $this->carritoActual($state);
        $cantidad = $intent['cantidad'] ?? 1;
        $noEncontrados = [];

        foreach ($intent['productos'] as $nombre) {
            $producto = $this->buscarProducto($nombre);
            
            // Si el buscador normal falla, intentar con la IA (Paso 1.5)
            if (!$producto) {
                $iaService = app(\App\Services\IAService::class);
                $menuNombres = \App\Models\Producto::where('activo', true)->pluck('nombre')->toArray();
                $nombreSugerido = $iaService->buscarProductoEnMenu($nombre, $menuNombres);
                
                if ($nombreSugerido) {
                    $producto = $this->buscarProducto($nombreSugerido);
                }
            }

            if ($producto) {
                $carrito = $this->agregarAlCarrito($carrito, $producto, $cantidad);
            } else {
                $noEncontrados[] = $nombre;
            }
        }

        if (empty($intent['productos']) || (!empty($noEncontrados) && empty($carrito['productos']))) {
            return [
                'estado' => 'producto_no_encontrado',
                'busqueda' => implode(', ', $noEncontrados),
                'carrito' => $carrito,
            ];
        }

        $state->update(['carrito' => $carrito, 'estado' => 'seleccionando']);

        return [
            'estado' => 'seleccionando',
            'carrito' => $carrito,
            'productos_no_encontrados' => $noEncontrados,
        ];
    }

    protected function reemplazarCarrito(Conversacion $estado, array $intent): array
    {
        // Empezar con carrito vacÃ­o
        $carrito  = ['productos' => [], 'total' => 0];
        $cantidad = $intent['cantidad'] ?? 1;
        $noEncontrados = [];

        foreach ($intent['productos'] as $nombre) {
            $producto = $this->buscarProducto($nombre);
            if ($producto) {
                $carrito = $this->agregarAlCarrito($carrito, $producto, $cantidad);
            } else {
                $noEncontrados[] = $nombre;
            }
        }

        if (empty($intent['productos'])) {
            return ['estado' => 'producto_no_encontrado', 'busqueda' => '', 'carrito' => $carrito];
        }

        $estado->update(['carrito' => $carrito, 'estado' => 'seleccionando']);

        Log::info('Carrito reemplazado:', ['telefono' => $estado->telefono, 'nuevo_carrito' => $carrito]);

        return [
            'estado'                   => 'reemplazado',
            'carrito'                  => $carrito,
            'productos_no_encontrados' => $noEncontrados,
        ];
    }

    protected function eliminarProductos(Conversacion $estado, array $intent): array
    {
        $carrito  = $this->carritoActual($estado);
        $cantidad = $intent['cantidad'] ?? 0;

        foreach ($intent['productos'] as $nombre) {
            $carrito = $this->quitarDelCarrito($carrito, $nombre, $cantidad);
        }

        $estado->update(['carrito' => $carrito]);

        if (empty($carrito['productos'])) {
            return ['estado' => 'carrito_vacio_confirmar', 'carrito' => $carrito];
        }

        return ['estado' => 'seleccionando', 'carrito' => $carrito];
    }

    // =========================================================================
    // Confirmar y cancelar pedido
    // =========================================================================

    protected function confirmarPedidoActivo(Conversacion $estado, ?string $direccion): array
    {
        $carrito = $this->carritoActual($estado);

        if (empty($carrito['productos'])) {
            return ['estado' => 'carrito_vacio_confirmar', 'carrito' => $carrito];
        }

        return DB::transaction(function () use ($estado, $carrito, $direccion) {
            $tipo = $direccion ? 'domicilio' : 'local';

            $pedido = Pedido::create([
                'user_id'     => 1,
                'tipo'        => $tipo,
                'estado'      => 'pendiente',
                'total'       => $carrito['total'],
                'direccion'   => $direccion,
                'numero_mesa' => $tipo === 'local' ? 0 : null,
            ]);

            foreach ($carrito['productos'] as $p) {
                PedidoDetalle::create([
                    'pedido_id'       => $pedido->id,
                    'producto_id'     => $p['producto_id'],
                    'cantidad'        => $p['cantidad'],
                    'precio_unitario' => $p['precio_unitario'],
                    'subtotal'        => $p['subtotal'],
                ]);
            }

            // Vaciar carrito y registrar pedido confirmado
            $estado->update([
                'carrito'         => ['productos' => [], 'total' => 0],
                'estado'          => 'confirmado',
                'pedido_activo_id' => $pedido->id,
            ]);

            Log::info('Pedido WhatsApp confirmado:', ['pedido_id' => $pedido->id, 'telefono' => $estado->telefono]);

            return [
                'estado'    => 'confirmado',
                'carrito'   => $carrito,
                'pedido_id' => $pedido->id,
                'direccion' => $direccion,
            ];
        });
    }

    protected function cancelarPedidoActivo(Conversacion $estado): array
    {
        $estado->update([
            'carrito'         => ['productos' => [], 'total' => 0],
            'estado'          => 'cancelado',
            'pedido_activo_id' => null,
        ]);

        return ['estado' => 'cancelado', 'carrito' => ['productos' => [], 'total' => 0]];
    }

    // =========================================================================
    // Helpers de carrito
    // =========================================================================

    protected function agregarAlCarrito(array $carrito, $producto, int $cantidad): array
    {
        $encontrado = false;
        foreach ($carrito['productos'] as &$item) {
            if ($item['producto_id'] == $producto->id) {
                $item['cantidad'] = min($item['cantidad'] + $cantidad, 100);
                $item['subtotal'] = (float)$producto->precio * $item['cantidad'];
                $encontrado = true;
                break;
            }
        }
        unset($item);

        if (!$encontrado) {
            $carrito['productos'][] = [
                'producto_id'     => $producto->id,
                'nombre'          => $producto->nombre,
                'cantidad'        => $cantidad,
                'precio_unitario' => (float)$producto->precio,
                'subtotal'        => (float)$producto->precio * $cantidad,
            ];
        }

        $carrito['total'] = collect($carrito['productos'])->sum('subtotal');

        return $carrito;
    }

    protected function quitarDelCarrito(array $carrito, string $nombre, int $cantidad): array
    {
        $nuevos = [];
        foreach ($carrito['productos'] as $item) {
            if (stripos($item['nombre'], $nombre) !== false) {
                if ($cantidad > 0 && $item['cantidad'] > $cantidad) {
                    $item['cantidad'] -= $cantidad;
                    $item['subtotal'] = (float)$item['precio_unitario'] * $item['cantidad'];
                    $nuevos[] = $item;
                }
                // cantidad 0 o >= stock â†’ eliminar Ã­tem completo
            } else {
                $nuevos[] = $item;
            }
        }

        $carrito['productos'] = array_values($nuevos);
        $carrito['total']     = collect($carrito['productos'])->sum('subtotal');

        return $carrito;
    }

    // =========================================================================
    // BÃºsqueda de producto en BD
    // =========================================================================

    protected function buscarProducto(string $nombre): ?object
    {
        $limpio = $this->limpiarTexto(trim($nombre));

        $producto = Producto::whereRaw("unaccent(nombre) ILIKE unaccent(?)", ["%{$limpio}%"])
            ->where('activo', true)
            ->first();

        if (!$producto) {
            $palabras = array_filter(explode(' ', $limpio), fn($p) => strlen($p) > 2);
            if (!empty($palabras)) {
                $query = Producto::where('activo', true);
                foreach ($palabras as $palabra) {
                    $query->whereRaw("unaccent(nombre) ILIKE unaccent(?)", ["%{$palabra}%"]);
                }
                $producto = $query->first();
            }
        }

        return $producto;
    }

    protected function limpiarTexto(string $texto): string
    {
        $map = [
            'Ã¡'=>'a','Ã©'=>'e','Ã­'=>'i','Ã³'=>'o','Ãº'=>'u',
            'Ã'=>'A','Ã‰'=>'E','Ã'=>'I','Ã“'=>'O','Ãš'=>'U',
            'Ã±'=>'n','Ã‘'=>'N','Ã¼'=>'u','Ãœ'=>'U',
        ];
        return strtr($texto, $map);
    }
}
