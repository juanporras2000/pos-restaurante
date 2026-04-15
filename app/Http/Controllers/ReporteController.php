<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pedido;
use App\Models\Pago;
use Carbon\Carbon;

class ReporteController extends Controller
{
    public function diario()
    {
        $hoy = Carbon::today();

        $pedidos = Pedido::whereDate('created_at', $hoy)->get();
        $pagos = Pago::whereDate('created_at', $hoy)->get();

        $totalVentas = $pedidos->sum('total');
        $totalPagos = $pagos->sum('recibido');
        $totalCambio = $pagos->sum('cambio');

        $cantidadPedidos = $pedidos->count();

        $promedioPedido = $cantidadPedidos > 0 
            ? $totalVentas / $cantidadPedidos 
            : 0;

        return response()->json([
            'fecha' => $hoy->toDateString(),
            'total_ventas' => $totalVentas,
            'total_recibido' => $totalPagos,
            'total_cambio' => $totalCambio,
            'cantidad_pedidos' => $cantidadPedidos,
            'promedio_pedido' => round($promedioPedido, 2)
        ]);
    }
}