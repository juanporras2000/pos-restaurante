<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Pago;
use App\Models\Insumo;
use App\Models\MovimientoInventario;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReporteController extends Controller
{
    // ─── Helper: rango de fechas desde query params ──────────────────────────
    private function rango(Request $request): array
    {
        $periodo = $request->query('periodo', 'dia');
        $desde   = $request->query('desde');
        $hasta   = $request->query('hasta');

        if ($desde && $hasta) {
            return [Carbon::parse($desde)->startOfDay(), Carbon::parse($hasta)->endOfDay()];
        }

        $ahora = Carbon::now();
        return match ($periodo) {
            'semana' => [$ahora->copy()->startOfWeek(), $ahora->copy()->endOfWeek()],
            'mes'    => [$ahora->copy()->startOfMonth(), $ahora->copy()->endOfMonth()],
            default  => [$ahora->copy()->startOfDay(), $ahora->copy()->endOfDay()],
        };
    }

    // ─── 1. Ventas por día / semana / mes ────────────────────────────────────
    public function ventas(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);
        $periodo         = $request->query('periodo', 'dia');

        $pgExpr = match ($periodo) {
            'semana' => "TO_CHAR(created_at, 'YYYY-MM-DD')",
            'mes'    => "TO_CHAR(created_at, 'YYYY-MM-DD')",
            default  => "TO_CHAR(created_at, 'HH24:00')",
        };

        $ventas = Pedido::whereBetween('created_at', [$desde, $hasta])
            ->whereNotNull('total')
            ->select(
                DB::raw("{$pgExpr} as periodo"),
                DB::raw('COUNT(*) as pedidos'),
                DB::raw('SUM(total) as total')
            )
            ->groupByRaw($pgExpr)
            ->orderByRaw($pgExpr)
            ->get();

        $resumen = Pedido::whereBetween('created_at', [$desde, $hasta])->whereNotNull('total');
        $count   = (clone $resumen)->count();
        $suma    = (clone $resumen)->sum('total');

        return response()->json([
            'periodo'          => $periodo,
            'desde'            => $desde->toDateTimeString(),
            'hasta'            => $hasta->toDateTimeString(),
            'total_ventas'     => round($suma, 2),
            'total_pedidos'    => $count,
            'promedio_pedido'  => $count > 0 ? round($suma / $count, 2) : 0,
            'serie'            => $ventas,
        ]);
    }

    // ─── 2. Ventas agrupadas por día (serie diaria) ──────────────────────────
    public function ventasPorFecha(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);

        $serie = Pedido::whereBetween('created_at', [$desde, $hasta])
            ->whereNotNull('total')
            ->select(
                DB::raw("DATE_TRUNC('day', created_at)::date as fecha"),
                DB::raw('COUNT(*) as pedidos'),
                DB::raw('SUM(total) as total')
            )
            ->groupByRaw("DATE_TRUNC('day', created_at)::date")
            ->orderByRaw("DATE_TRUNC('day', created_at)::date")
            ->get();

        return response()->json([
            'desde' => $desde->toDateString(),
            'hasta' => $hasta->toDateString(),
            'serie' => $serie,
        ]);
    }

    // ─── 3. Productos más vendidos ────────────────────────────────────────────
    public function productosTop(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);
        $limit           = (int) $request->query('limit', 10);

        $productos = PedidoDetalle::whereBetween('pedido_detalles.created_at', [$desde, $hasta])
            ->join('productos', 'pedido_detalles.producto_id', '=', 'productos.id')
            ->select(
                'productos.id',
                'productos.nombre',
                DB::raw('SUM(pedido_detalles.cantidad) as cantidad_vendida'),
                DB::raw('SUM(pedido_detalles.subtotal) as ingreso_total')
            )
            ->groupBy('productos.id', 'productos.nombre')
            ->orderByDesc('cantidad_vendida')
            ->limit($limit)
            ->get();

        return response()->json([
            'desde'     => $desde->toDateString(),
            'hasta'     => $hasta->toDateString(),
            'productos' => $productos,
        ]);
    }

    // ─── 3. Ingresos totales ──────────────────────────────────────────────────
    public function ingresos(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);

        $pagos = Pago::whereBetween('created_at', [$desde, $hasta]);

        return response()->json([
            'desde'          => $desde->toDateString(),
            'hasta'          => $hasta->toDateString(),
            'total_recibido' => round((clone $pagos)->sum('recibido'), 2),
            'total_cambio'   => round((clone $pagos)->sum('cambio'), 2),
            'neto'           => round((clone $pagos)->sum(DB::raw('recibido - cambio')), 2),
            'cantidad_pagos' => (clone $pagos)->count(),
        ]);
    }

    // ─── 4. Ganancia estimada (precio venta − costo insumos) ─────────────────
    public function ganancias(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);

        // Detalles de pedidos en el rango con insumos y sus costos
        $detalles = PedidoDetalle::whereBetween('pedido_detalles.created_at', [$desde, $hasta])
            ->join('productos', 'pedido_detalles.producto_id', '=', 'productos.id')
            ->leftJoin('producto_insumo', 'productos.id', '=', 'producto_insumo.producto_id')
            ->leftJoin('insumos', 'producto_insumo.insumo_id', '=', 'insumos.id')
            ->select(
                DB::raw('SUM(pedido_detalles.subtotal) as ingreso'),
                // costo estimado = cantidad_insumo_por_producto * costo_unitario_insumo * unidades_vendidas
                // Se usa 0 si no hay costo_unitario registrado en insumos
                DB::raw('SUM(COALESCE(producto_insumo.cantidad, 0) * COALESCE(insumos.costo_unitario, 0) * pedido_detalles.cantidad) as costo_estimado')
            )
            ->first();

        $ingreso       = round($detalles->ingreso ?? 0, 2);
        $costoEstimado = round($detalles->costo_estimado ?? 0, 2);

        return response()->json([
            'desde'          => $desde->toDateString(),
            'hasta'          => $hasta->toDateString(),
            'ingreso'        => $ingreso,
            'costo_estimado' => $costoEstimado,
            'ganancia'       => round($ingreso - $costoEstimado, 2),
            'nota'           => 'Ganancia estimada basada en costo_unitario de insumos. Agregar campo costo_unitario a insumos para mayor precisión.',
        ]);
    }

    // ─── 5. Métodos de pago ───────────────────────────────────────────────────
    public function metodosPago(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);

        $metodos = Pago::whereBetween('created_at', [$desde, $hasta])
            ->select(
                'metodo_pago',
                DB::raw('COUNT(*) as cantidad'),
                DB::raw('SUM(recibido - cambio) as total_neto')
            )
            ->groupBy('metodo_pago')
            ->orderByDesc('total_neto')
            ->get();

        return response()->json([
            'desde'   => $desde->toDateString(),
            'hasta'   => $hasta->toDateString(),
            'metodos' => $metodos,
        ]);
    }

    // ─── 6. Stock de insumos ──────────────────────────────────────────────────
    public function stockInsumos(Request $request)
    {
        $soloAlertas = filter_var($request->query('alertas', false), FILTER_VALIDATE_BOOLEAN);

        $query = Insumo::select('id', 'nombre', 'unidad_medida', 'stock_actual', 'stock_minimo')
            ->orderBy('nombre');

        if ($soloAlertas) {
            $query->whereColumn('stock_actual', '<=', 'stock_minimo');
        }

        $insumos = $query->get()->map(function ($insumo) {
            $insumo->alerta = $insumo->stock_actual <= $insumo->stock_minimo;
            return $insumo;
        });

        return response()->json([
            'total'          => $insumos->count(),
            'en_alerta'      => $insumos->where('alerta', true)->count(),
            'insumos'        => $insumos,
        ]);
    }

    // ─── 7. Insumos más usados ────────────────────────────────────────────────
    public function insumosTop(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);
        $limit           = (int) $request->query('limit', 10);

        $insumos = MovimientoInventario::whereBetween('movimientos_inventario.created_at', [$desde, $hasta])
            ->where('tipo', 'consumo')
            ->join('insumos', 'movimientos_inventario.insumo_id', '=', 'insumos.id')
            ->select(
                'insumos.id',
                'insumos.nombre',
                'insumos.unidad_medida',
                DB::raw('SUM(ABS(movimientos_inventario.cantidad)) as total_usado')
            )
            ->groupBy('insumos.id', 'insumos.nombre', 'insumos.unidad_medida')
            ->orderByDesc('total_usado')
            ->limit($limit)
            ->get();

        return response()->json([
            'desde'   => $desde->toDateString(),
            'hasta'   => $hasta->toDateString(),
            'insumos' => $insumos,
        ]);
    }

    // ─── Reporte diario (legacy) ──────────────────────────────────────────────
    public function diario()
    {
        $inicio = now()->startOfDay()->utc();
        $fin    = now()->endOfDay()->utc();

        $pedidos = Pedido::whereBetween('created_at', [$inicio, $fin])->get();
        $pagos   = Pago::whereBetween('created_at', [$inicio, $fin])->get();

        $totalVentas    = $pedidos->sum('total');
        $totalPagos     = $pagos->sum('recibido');
        $totalCambio    = $pagos->sum('cambio');
        $cantidadPedidos = $pedidos->count();

        return response()->json([
            'fecha'           => $hoy->toDateString(),
            'total_ventas'    => $totalVentas,
            'total_recibido'  => $totalPagos,
            'total_cambio'    => $totalCambio,
            'cantidad_pedidos' => $cantidadPedidos,
            'promedio_pedido' => $cantidadPedidos > 0 ? round($totalVentas / $cantidadPedidos, 2) : 0,
        ]);
    }
}