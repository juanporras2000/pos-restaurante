<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Producto;

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

    public function store(Request $request)
    {
        // Crear pedido
        $pedido = Pedido::create([
            'user_id' => auth()->id(),
            'tipo' => $request->tipo,
            'numero_mesa' => $request->numero_mesa,
            'direccion' => $request->direccion,
            'total' => 0
        ]);

        $total = 0;

        // Recorrer productos
        foreach ($request->productos as $item) {
            $producto = Producto::findOrFail($item['producto_id']);

            $subtotal = $producto->precio * $item['cantidad'];

            PedidoDetalle::create([
                'pedido_id' => $pedido->id,
                'producto_id' => $producto->id,
                'cantidad' => $item['cantidad'],
                'precio_unitario' => $producto->precio,
                'subtotal' => $subtotal,
                'observacion' => $item['observacion'] ?? null
            ]);

            $total += $subtotal;
        }

        // Actualizar total del pedido
        $pedido->update([
            'total' => $total
        ]);

        return response()->json([
            'mensaje' => 'Pedido creado correctamente',
            'pedido' => $pedido
        ]);
    }

    public function destroy($id)
    {
        $pedido = Pedido::where('user_id', auth()->id())->findOrFail($id);

        if ($pedido->pago) {
            return response()->json(['error' => 'No se puede eliminar un pedido que ya tiene pago'], 400);
        }

        $pedido->detalles()->delete();
        $pedido->delete();

        return response()->json(['mensaje' => 'Pedido eliminado correctamente']);
    }
}
