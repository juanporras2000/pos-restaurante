<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pedido;
use App\Models\Pago;


class PagoController extends Controller
{
    public function store(Request $request)
    {
        // ✅ Validación
        $request->validate([
            'pedido_id' => 'required|integer',
            'recibido' => 'required|numeric|min:0'
        ]);

        // ✅ Buscar pedido (sin lanzar excepción automática)
        $pedido = Pedido::find($request->pedido_id);

        if (!$pedido) {
            return response()->json([
                'error' => 'Pedido no encontrado'
            ], 404);
        }

        // ✅ Validar estado
        if ($pedido->estado === 'pagado') {
            return response()->json([
                'error' => 'El pedido ya está pagado'
            ], 400);
        }

        $total = $pedido->total;
        $recibido = $request->recibido;

        // ✅ Validar dinero suficiente
        if ($recibido < $total) {
            return response()->json([
                'error' => 'El dinero recibido es insuficiente'
            ], 400);
        }

        $cambio = $recibido - $total;

        // ✅ Crear pago (campos correctos)
        $pago = Pago::create([
            'pedido_id' => $pedido->id,
            'total' => $total,
            'recibido' => $recibido,
            'cambio' => $cambio,
        ]);

        // ✅ Actualizar estado del pedido
        $pedido->update([
            'estado' => 'pagado'
        ]);

        return response()->json([
            'mensaje' => 'Pago realizado correctamente',
            'pago' => $pago,
            'cambio' => $cambio
        ], 201);
    }
}