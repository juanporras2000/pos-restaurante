<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Pedido;
use App\Services\PedidoService;
use Illuminate\Support\Facades\Auth;

class PedidoController extends Controller
{
    public function pendientes()
    {
        $pedidos = Pedido::where('user_id', Auth::id())
            ->whereDoesntHave('pago')
            ->with(['detalles.producto', 'perfil'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($pedidos);
    }

    public function cerradosHoy()
    {
        $inicio = now()->startOfDay()->utc();
        $fin    = now()->endOfDay()->utc();

        $pedidos = Pedido::where('estado', 'pagado')
            ->whereBetween('created_at', [$inicio, $fin])
            ->with(['detalles.producto', 'pago.detalles', 'perfil'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($pedidos);
    }

   public function store(Request $request, PedidoService $pedidoService)
    {
        $request->validate([
            'tipo'          => 'required|in:mesa,domicilio,recoger',
            'numero_mesa'   => 'nullable|integer|min:1',
            'direccion'     => 'nullable|string|max:1000',
            'nombre_cliente'=> 'nullable|string|max:100',
            'productos'     => 'required|array|min:1',
            'productos.*.producto_id' => 'required|exists:productos,id',
            'productos.*.cantidad'    => 'required|integer|min:1',
            'id_perfil'     => 'required|exists:perfil,id_perfil'
        ]);

        try {
            // Se delega toda la lógica de negocio al servicio
            $pedido = $pedidoService->crearPedido($request->all());

            broadcast(new \App\Events\InventarioActualizado(
                \App\Models\Insumo::whereColumn('stock_actual', '<=', 'stock_minimo')->where('stock_minimo', '>', 0)->orderBy('nombre')->get()->toArray()
            ));

            return response()->json([
                'mensaje' => 'Pedido creado correctamente',
                'pedido'  => $pedido->load('perfil'),
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Maneja la excepción de stock insuficiente retornando el error de validación 422
            return $e->getResponse();
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Hubo un problema al crear el pedido.',
                'detalle' => $e->getMessage()
            ], 500);
        }
    }

   public function update(Request $request, $id, PedidoService $pedidoService)
    {
        $pedido = Pedido::where('user_id', Auth::id())->findOrFail($id);

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

        try {
            // Toda la lógica pesada ahora vive delegada en una sola línea del servicio
            $pedidoActualizado = $pedidoService->actualizarPedido($pedido, $request->all());

            event(new \App\Events\PedidoActualizado($pedidoActualizado));

            broadcast(new \App\Events\InventarioActualizado(
                \App\Models\Insumo::whereColumn('stock_actual', '<=', 'stock_minimo')->where('stock_minimo', '>', 0)->orderBy('nombre')->get()->toArray()
            ));

            return response()->json([
                'mensaje' => 'Pedido actualizado correctamente',
                'pedido'  => $pedidoActualizado->load('detalles.producto', 'perfil'),
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Retorna la respuesta HTTP de stock insuficiente (422) arrojada por el Service
            return $e->getResponse();
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Hubo un problema al actualizar el pedido.',
                'detalle' => $e->getMessage()
            ], 500);
        }
    }


    public function destroy(Request $request, $id, PedidoService $pedidoService)
    {
        $pedido = Pedido::where('user_id', Auth::id())->findOrFail($id);

        if ($pedido->pago) {
            return response()->json(['error' => 'No se puede eliminar un pedido que ya tiene pago'], 400);
        }

        $request->validate([
            'razon_eliminacion' => 'required|string|max:500',
        ]);

        try {
            // Toda la lógica transaccional de inventario delegada al servicio
            $pedidoService->eliminarPedido($pedido, $request->razon_eliminacion);

            event(new \App\Events\PedidoEliminado($pedido));

            broadcast(new \App\Events\InventarioActualizado(
                \App\Models\Insumo::whereColumn('stock_actual', '<=', 'stock_minimo')->where('stock_minimo', '>', 0)->orderBy('nombre')->get()->toArray()
            ));

            return response()->json(['mensaje' => 'Pedido eliminado correctamente y stock restaurado con éxito.']);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Hubo un problema al procesar la cancelación del pedido.',
                'detalle' => $e->getMessage()
            ], 500);
        }
    }
}
