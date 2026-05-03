<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Producto;
use App\Models\Insumo;
use App\Models\MovimientoInventario;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PedidoController extends Controller
{
    public function pendientes()
    {
        $pedidos = Pedido::where('user_id', auth()->id())
            ->whereDoesntHave('pago')
            ->with(['detalles.producto'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($pedidos);
    }

    public function cerradosHoy()
    {
        $pedidos = Pedido::where('estado', 'pagado')
            ->whereDate('updated_at', today())
            ->with(['detalles.producto', 'pago'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($pedidos);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tipo'          => 'required|in:mesa,domicilio,recoger',
            'numero_mesa'   => 'nullable|integer|min:1',
            'direccion'     => 'nullable|string|max:500',
            'nombre_cliente' => 'nullable|string|max:100',
            'productos'     => 'required|array|min:1',
            'productos.*.producto_id' => 'required|exists:productos,id',
            'productos.*.cantidad'    => 'required|integer|min:1',
        ]);

        // --- Verificación de stock ---
        // Acumular consumo total por insumo considerando todos los items del pedido
        $consumo = []; // [ insumo_id => cantidad_total_requerida ]

        $productos = [];
        foreach ($request->productos as $item) {
            $producto = Producto::with('insumos')->findOrFail($item['producto_id']);
            $productos[] = ['producto' => $producto, 'cantidad' => $item['cantidad'], 'observacion' => $item['observacion'] ?? null, 'adiciones' => $item['adiciones'] ?? []];

            foreach ($producto->insumos as $insumo) {
                $id = $insumo->id;
                $necesario = $insumo->pivot->cantidad * $item['cantidad'];
                $consumo[$id] = ($consumo[$id] ?? 0) + $necesario;
            }
        }

        // --- Crear pedido y descontar stock en una transacción ---
        try {
            $pedido = DB::transaction(function () use ($request, $productos, $consumo) {
            // Validar y bloquear stock dentro de la transacción (necesario para PostgreSQL)
            if (!empty($consumo)) {
                $insumosBloqueados = Insumo::whereIn('id', array_keys($consumo))->lockForUpdate()->get()->keyBy('id');
                $faltantes = [];
                foreach ($consumo as $insumoId => $necesario) {
                    $ins = $insumosBloqueados->get($insumoId);
                    if ($ins && $ins->stock_actual < $necesario) {
                        $faltantes[] = "{$ins->nombre}: necesario {$necesario} {$ins->unidad_medida}, disponible {$ins->stock_actual} {$ins->unidad_medida}";
                    }
                }
                if (!empty($faltantes)) {
                    // Lanzar excepción para que el transaction haga rollback
                    throw new \Illuminate\Validation\ValidationException(
                        \Illuminate\Support\Facades\Validator::make([], []),
                        response()->json(['error' => 'Stock insuficiente', 'faltantes' => $faltantes], 422)
                    );
                }
            }

            $pedido = Pedido::create([
                'user_id'        => auth()->id(),
                'tipo'           => $request->tipo,
                'numero_mesa'    => $request->numero_mesa,
                'direccion'      => $request->direccion,
                'nombre_cliente' => $request->nombre_cliente,
                'total'          => 0,
            ]);

            $total = 0;
            foreach ($productos as $item) {
                $producto = $item['producto'];
                $subtotal = $producto->precio * $item['cantidad'];

                // Calcular subtotal de adiciones
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
                    'pedido_id'       => $pedido->id,
                    'producto_id'     => $producto->id,
                    'cantidad'        => $item['cantidad'],
                    'precio_unitario' => $producto->precio,
                    'subtotal'        => $subtotal,
                    'observacion'     => $item['observacion'],
                    'adiciones'       => !empty($adicionesData) ? $adicionesData : null,
                ]);

                $total += $subtotal;
            }

            $pedido->update(['total' => $total]);

            // Descontar stock de insumos y registrar movimientos
            foreach ($consumo as $insumoId => $cantidad) {
                $insumo = Insumo::find($insumoId);
                if (!$insumo) continue;

                $stockAntes = $insumo->stock_actual;
                $insumo->decrement('stock_actual', $cantidad);
                $insumo->refresh();

                MovimientoInventario::create([
                    'insumo_id'     => $insumoId,
                    'user_id'       => auth()->id(),
                    'pedido_id'     => $pedido->id,
                    'tipo'          => 'salida',
                    'cantidad'      => $cantidad,
                    'stock_antes'   => $stockAntes,
                    'stock_despues' => $insumo->stock_actual,
                    'motivo'        => "Venta - Pedido #{$pedido->id}",
                ]);
            }

            return $pedido;
        });

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $e->getResponse();
        }

        return response()->json([
            'mensaje' => 'Pedido creado correctamente',
            'pedido'  => $pedido,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $pedido = Pedido::where('user_id', auth()->id())->findOrFail($id);

        if ($pedido->pago) {
            return response()->json(['error' => 'No se puede editar un pedido que ya tiene pago'], 400);
        }

        $request->validate([
            'tipo'          => 'required|in:mesa,domicilio,recoger',
            'numero_mesa'   => 'nullable|integer|min:1',
            'direccion'     => 'nullable|string|max:500',
            'nombre_cliente'=> 'nullable|string|max:100',
            'productos'     => 'required|array|min:1',
            'productos.*.producto_id' => 'required|exists:productos,id',
            'productos.*.cantidad'    => 'required|integer|min:1',
        ]);

        // Reemplazar detalles
        $pedido->detalles()->delete();

        $total = 0;
        foreach ($request->productos as $item) {
            $producto = Producto::findOrFail($item['producto_id']);
            $subtotal = $producto->precio * $item['cantidad'];

            // Calcular subtotal de adiciones
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
                'pedido_id'       => $pedido->id,
                'producto_id'     => $producto->id,
                'cantidad'        => $item['cantidad'],
                'precio_unitario' => $producto->precio,
                'subtotal'        => $subtotal,
                'observacion'     => $item['observacion'] ?? null,
                'adiciones'       => !empty($adicionesData) ? $adicionesData : null,
            ]);

            $total += $subtotal;
        }

        $pedido->update([
            'tipo'           => $request->tipo,
            'numero_mesa'    => $request->numero_mesa,
            'direccion'      => $request->direccion,
            'nombre_cliente' => $request->nombre_cliente,
            'total'          => $total,
        ]);

        return response()->json([
            'mensaje' => 'Pedido actualizado correctamente',
            'pedido'  => $pedido->load('detalles.producto'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $pedido = Pedido::where('user_id', auth()->id())->findOrFail($id);

        if ($pedido->pago) {
            return response()->json(['error' => 'No se puede eliminar un pedido que ya tiene pago'], 400);
        }

        $request->validate([
            'razon_eliminacion' => 'required|string|max:500',
        ]);

        // Eliminado lógico: guarda la razón y hace soft delete
        $pedido->update(['razon_eliminacion' => $request->razon_eliminacion]);
        $pedido->delete(); // SoftDeletes: setea deleted_at

        return response()->json(['mensaje' => 'Pedido eliminado correctamente']);
    }
}
