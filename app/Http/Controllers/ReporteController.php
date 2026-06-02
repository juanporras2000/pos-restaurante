<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Pago;
use App\Models\PagoDetalle;
use App\Models\Gasto;
use App\Models\Insumo;
use App\Models\MovimientoInventario;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReporteController extends Controller
{
    // ─── Helper: rango del período ANTERIOR para comparativas ───────────────
    private function rangoAnterior(string $periodo, ?string $desde, ?string $hasta): array
    {
        // Si es rango personalizado, calculamos el mismo intervalo en días hacia atrás
        if ($desde && $hasta) {
            $ini  = Carbon::parse($desde)->startOfDay();
            $fin  = Carbon::parse($hasta)->endOfDay();
            $dias = $ini->diffInDays($fin) + 1;
            return [
                $ini->copy()->subDays($dias)->utc(),
                $fin->copy()->subDays($dias)->utc(),
            ];
        }

        $ahora = Carbon::now();
        return match ($periodo) {
            'semana' => [
                $ahora->copy()->subWeek()->startOfWeek()->utc(),
                $ahora->copy()->subWeek()->endOfWeek()->utc(),
            ],
            'mes' => [
                $ahora->copy()->subMonth()->startOfMonth()->utc(),
                $ahora->copy()->subMonth()->endOfMonth()->utc(),
            ],
            default => [
                $ahora->copy()->subDay()->startOfDay()->utc(),
                $ahora->copy()->subDay()->endOfDay()->utc(),
            ],
        };
    }

    // ─── Helper: calcula resumen de ventas en un rango ───────────────────────
    private function resumenVentas(Carbon $desde, Carbon $hasta): array
    {
        $query  = Pedido::whereBetween('created_at', [$desde, $hasta])->whereNotNull('total');
        $count  = (clone $query)->count();
        $suma   = (clone $query)->sum('total');
        return [
            'total_ventas'    => round($suma, 2),
            'total_pedidos'   => $count,
            'promedio_pedido' => $count > 0 ? round($suma / $count, 2) : 0,
        ];
    }

    // ─── Helper: calcula porcentaje de cambio ────────────────────────────────
    private static function pct(float $actual, float $anterior): ?float
    {
        if ($anterior == 0) return null;
        return round((($actual - $anterior) / abs($anterior)) * 100, 1);
    }

    // ─── Helper: rango de fechas desde query params ──────────────────────────
    private function rango(Request $request): array
    {
        $periodo = $request->query('periodo', 'dia');
        $desde   = $request->query('desde');
        $hasta   = $request->query('hasta');

        if ($desde && $hasta) {
            return [
                Carbon::parse($desde)->startOfDay()->utc(),
                Carbon::parse($hasta)->endOfDay()->utc(),
            ];
        }

        $ahora = Carbon::now();
        return match ($periodo) {
            'semana' => [$ahora->copy()->startOfWeek()->utc(), $ahora->copy()->endOfWeek()->utc()],
            'mes'    => [$ahora->copy()->startOfMonth()->utc(), $ahora->copy()->endOfMonth()->utc()],
            default  => [$ahora->copy()->startOfDay()->utc(), $ahora->copy()->endOfDay()->utc()],
        };
    }

    // ─── 1. Ventas por día / semana / mes ────────────────────────────────────
    public function ventas(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);
        $periodo         = $request->query('periodo', 'dia');
        $desde_raw       = $request->query('desde');
        $hasta_raw       = $request->query('hasta');

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

        $actual   = $this->resumenVentas($desde, $hasta);
        [$dprev, $hprev] = $this->rangoAnterior($periodo, $desde_raw, $hasta_raw);
        $anterior = $this->resumenVentas($dprev, $hprev);

        return response()->json([
            'periodo'          => $periodo,
            'desde'            => $desde->toDateTimeString(),
            'hasta'            => $hasta->toDateTimeString(),
            'total_ventas'     => $actual['total_ventas'],
            'total_pedidos'    => $actual['total_pedidos'],
            'promedio_pedido'  => $actual['promedio_pedido'],
            'comparativa'      => [
                'total_ventas'    => self::pct($actual['total_ventas'],   $anterior['total_ventas']),
                'total_pedidos'   => self::pct($actual['total_pedidos'],  $anterior['total_pedidos']),
                'promedio_pedido' => self::pct($actual['promedio_pedido'], $anterior['promedio_pedido']),
            ],
            'serie' => $ventas,
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
            ->join('pedidos', 'pedido_detalles.pedido_id', '=', 'pedidos.id')
            ->join('productos', 'pedido_detalles.producto_id', '=', 'productos.id')
            ->when(app()->has('tenant_id'), fn($q) => $q->where('pedidos.tenant_id', app('tenant_id')))
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
            ->join('pedidos', 'pedido_detalles.pedido_id', '=', 'pedidos.id')
            ->join('productos', 'pedido_detalles.producto_id', '=', 'productos.id')
            ->leftJoin('producto_insumo', 'productos.id', '=', 'producto_insumo.producto_id')
            ->leftJoin('insumos', 'producto_insumo.insumo_id', '=', 'insumos.id')
            ->when(app()->has('tenant_id'), fn($q) => $q->where('pedidos.tenant_id', app('tenant_id')))
            ->select(
                DB::raw('SUM(pedido_detalles.subtotal) as ingreso'),
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

        $metodos = PagoDetalle::whereBetween('created_at', [$desde, $hasta])
            ->select(
                'metodo_pago',
                DB::raw('COUNT(*) as cantidad'),
                DB::raw('SUM(monto) as total_neto')
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

    // ─── 8. Gastos agrupados por período ─────────────────────────────────────
    public function gastosPorPeriodo(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);
        $periodo         = $request->query('periodo', 'dia');
        $desde_raw       = $request->query('desde');
        $hasta_raw       = $request->query('hasta');

        $gastos = Gasto::whereBetween('created_at', [$desde, $hasta]);

        $totalActual = round((clone $gastos)->sum('monto'), 2);
        $porTipo     = (clone $gastos)
            ->select('tipo', DB::raw('SUM(monto) as total'), DB::raw('COUNT(*) as cantidad'))
            ->groupBy('tipo')
            ->orderByDesc('total')
            ->get();

        // Comparativa con período anterior
        [$dprev, $hprev] = $this->rangoAnterior($periodo, $desde_raw, $hasta_raw);
        $totalAnterior   = round(Gasto::whereBetween('created_at', [$dprev, $hprev])->sum('monto'), 2);

        return response()->json([
            'desde'      => $desde->toDateString(),
            'hasta'      => $hasta->toDateString(),
            'total'      => $totalActual,
            'por_tipo'   => $porTipo,
            'comparativa'=> self::pct($totalActual, $totalAnterior),
        ]);
    }

    // ─── 9. Distribución por tipo de pedido (mesa / domicilio / recoger) ────
    public function tipoPedido(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);

        $tipos = Pedido::whereBetween('created_at', [$desde, $hasta])
            ->select(
                'tipo',
                DB::raw('COUNT(*) as cantidad'),
                DB::raw('SUM(total) as total_ventas')
            )
            ->groupBy('tipo')
            ->orderByDesc('cantidad')
            ->get();

        $totalPedidos = $tipos->sum('cantidad');

        $tipos = $tipos->map(function ($t) use ($totalPedidos) {
            $t->porcentaje = $totalPedidos > 0
                ? round(($t->cantidad / $totalPedidos) * 100, 1)
                : 0;
            return $t;
        });

        return response()->json([
            'desde'          => $desde->toDateString(),
            'hasta'          => $hasta->toDateString(),
            'total_pedidos'  => $totalPedidos,
            'tipos'          => $tipos,
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
            'fecha'           => now()->toDateString(),
            'total_ventas'    => $totalVentas,
            'total_recibido'  => $totalPagos,
            'total_cambio'    => $totalCambio,
            'cantidad_pedidos' => $cantidadPedidos,
            'promedio_pedido' => $cantidadPedidos > 0 ? round($totalVentas / $cantidadPedidos, 2) : 0,
        ]);
    }
}