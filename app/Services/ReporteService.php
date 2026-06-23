<?php

namespace App\Services;

use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Pago;
use App\Models\PagoDetalle;
use App\Models\Gasto;
use App\Models\Insumo;
use App\Models\MovimientoInventario;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReporteService
{
    /**
     * Construye la serie temporal de ventas y su comparativa con el periodo anterior.
     */
    public function obtenerVentasSerie(Carbon $desde, Carbon $hasta, string $periodo, ?string $desdeRaw, ?string $hastaRaw): array
    {
        $pgExpr = match ($periodo) {
            'semana', 'mes' => "TO_CHAR(created_at, 'YYYY-MM-DD')",
            default         => "TO_CHAR(created_at, 'HH24:00')",
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

        $actual = $this->resumenVentas($desde, $hasta);
        [$dprev, $hprev] = $this->rangoAnterior($periodo, $desdeRaw, $hastaRaw);
        $anterior = $this->resumenVentas($dprev, $hprev);

        return [
            'periodo'          => $periodo,
            'desde'            => $desde->toDateTimeString(),
            'hasta'            => $hasta->toDateTimeString(),
            'total_ventas'     => $actual['total_ventas'],
            'total_pedidos'    => $actual['total_pedidos'],
            'promedio_pedido'  => $actual['promedio_pedido'],
            'comparativa'      => [
                'total_ventas'    => $this->pct($actual['total_ventas'],   $anterior['total_ventas']),
                'total_pedidos'   => $this->pct($actual['total_pedidos'],  $anterior['total_pedidos']),
                'promedio_pedido' => $this->pct($actual['promedio_pedido'], $anterior['promedio_pedido']),
            ],
            'serie' => $ventas,
        ];
    }

    /**
     * Obtiene las ventas agrupadas estrictamente de forma diaria.
     */
    public function obtenerVentasPorFecha(Carbon $desde, Carbon $hasta): array
    {
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

        return [
            'desde' => $desde->toDateString(),
            'hasta' => $hasta->toDateString(),
            'serie' => $serie,
        ];
    }

    /**
     * Obtiene el ranking de los productos más vendidos.
     */
    public function obtenerProductosTop(Carbon $desde, Carbon $hasta, int $limit = 10): array
    {
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

        return [
            'desde'     => $desde->toDateString(),
            'hasta'     => $hasta->toDateString(),
            'productos' => $productos,
        ];
    }

    /**
     * Obtiene el resumen de ingresos brutos y netos recibidos en caja.
     */
    public function obtenerResumenIngresos(Carbon $desde, Carbon $hasta): array
    {
        $pagos = Pago::whereBetween('created_at', [$desde, $hasta]);

        return [
            'desde'          => $desde->toDateString(),
            'hasta'          => $hasta->toDateString(),
            'total_recibido' => round((clone $pagos)->sum('recibido'), 2),
            'total_cambio'   => round((clone $pagos)->sum('cambio'), 2),
            'neto'           => round((clone $pagos)->sum(DB::raw('recibido - cambio')), 2),
            'amount_pagos'   => (clone $pagos)->count(),
        ];
    }

    /**
     * Calcula la ganancia estimada cruzando la venta contra el costo de insumos configurados.
     */
    public function obtenerGananciaEstimada(Carbon $desde, Carbon $hasta): array
    {
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

        return [
            'desde'          => $desde->toDateString(),
            'hasta'          => $hasta->toDateString(),
            'ingreso'        => $ingreso,
            'costo_estimado' => $costoEstimado,
            'ganancia'       => round($ingreso - $costoEstimado, 2),
            'nota'           => 'Ganancia estimada basada en costo_unitario de insumos. Agregar campo costo_unitario a insumos para mayor precisión.',
        ];
    }

    /**
     * Retorna la distribución de flujos agrupados por el método de pago utilizado.
     */
    public function obtenerMetodosPago(Carbon $desde, Carbon $hasta): array
    {
        $metodos = PagoDetalle::whereBetween('created_at', [$desde, $hasta])
            ->select(
                'metodo_pago',
                DB::raw('COUNT(*) as cantidad'),
                DB::raw('SUM(monto) as total_neto')
            )
            ->groupBy('metodo_pago')
            ->orderByDesc('total_neto')
            ->get();

        return [
            'desde'   => $desde->toDateString(),
            'hasta'   => $hasta->toDateString(),
            'metodos' => $metodos,
        ];
    }

    /**
     * Devuelve el consolidado de stock actual e insumos en estado crítico.
     */
    public function obtenerEstadoStockInsumos(bool $soloAlertas): array
    {
        $query = Insumo::select('id', 'nombre', 'unidad_medida', 'stock_actual', 'stock_minimo')
            ->orderBy('nombre');

        if ($soloAlertas) {
            $query->whereColumn('stock_actual', '<=', 'stock_minimo');
        }

        $insumos = $query->get()->map(function ($insumo) {
            $insumo->alerta = $insumo->stock_actual <= $insumo->stock_minimo;
            return $insumo;
        });

        return [
            'total'     => $insumos->count(),
            'en_alerta' => $insumos->where('alerta', true)->count(),
            'insumos'   => $insumos,
        ];
    }

    /**
     * Ranking de explotación y consumo de insumos en cocina.
     */
    public function obtenerInsumosTop(Carbon $desde, Carbon $hasta, int $limit = 10): array
    {
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

        return [
            'desde'   => $desde->toDateString(),
            'hasta'   => $hasta->toDateString(),
            'insumos' => $insumos,
        ];
    }

    /**
     * Totaliza los egresos operativos y calcula el diferencial porcentual del histórico.
     */
    public function obtenerGastosResumen(Carbon $desde, Carbon $hasta, string $periodo, ?string $desdeRaw, ?string $hastaRaw): array
    {
        $gastos = Gasto::whereBetween('created_at', [$desde, $hasta]);

        $totalActual = round((clone $gastos)->sum('monto'), 2);
        $porTipo     = (clone $gastos)
            ->select('tipo', DB::raw('SUM(monto) as total'), DB::raw('COUNT(*) as cantidad'))
            ->groupBy('tipo')
            ->orderByDesc('total')
            ->get();

        [$dprev, $hprev] = $this->rangoAnterior($periodo, $desdeRaw, $hasta_raw = $hastaRaw);
        $totalAnterior   = round(Gasto::whereBetween('created_at', [$dprev, $hprev])->sum('monto'), 2);

        return [
            'desde'       => $desde->toDateString(),
            'hasta'       => $hasta->toDateString(),
            'total'       => $totalActual,
            'por_tipo'    => $porTipo,
            'comparativa' => $this->pct($totalActual, $totalAnterior),
        ];
    }

    /**
     * Mapea la distribución porcentual de los canales de atención del restaurante.
     */
    public function obtenerDistribuciónTipoPedido(Carbon $desde, Carbon $hasta): array
    {
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
            $t->porcentaje = $totalPedidos > 0 ? round(($t->cantidad / $totalPedidos) * 100, 1) : 0;
            return $t;
        });

        return [
            'desde'         => $desde->toDateString(),
            'hasta'         => $hasta->toDateString(),
            'total_pedidos' => $totalPedidos,
            'tipos'         => $tipos,
        ];
    }

    /**
     * Cierre arqueado básico del día (Legacy).
     */
    public function obtenerReporteDiarioLegacy(): array
    {
        $inicio = now()->startOfDay()->utc();
        $fin    = now()->endOfDay()->utc();

        $pedidos = Pedido::whereBetween('created_at', [$inicio, $fin])->get();
        $pagos   = Pago::whereBetween('created_at', [$inicio, $fin])->get();

        $totalVentas     = $pedidos->sum('total');
        $totalPagos      = $pagos->sum('recibido');
        $totalCambio     = $pagos->sum('cambio');
        $cantidadPedidos = $pedidos->count();

        return [
            'fecha'            => now()->toDateString(),
            'total_ventas'     => $totalVentas,
            'total_recibido'   => $totalPagos,
            'total_cambio'     => $totalCambio,
            'cantidad_pedidos' => $cantidadPedidos,
            'promedio_pedido'  => $cantidadPedidos > 0 ? round($totalVentas / $cantidadPedidos, 2) : 0,
        ];
    }

    // ─── Métodos Auxiliares Internos del Dominio de Cómputo ───

    private function resumenVentas(Carbon $desde, Carbon $hasta): array
    {
        $query = Pedido::whereBetween('created_at', [$desde, $hasta])->whereNotNull('total');
        $count = (clone $query)->count();
        $suma  = (clone $query)->sum('total');
        return [
            'total_ventas'    => round($suma, 2),
            'total_pedidos'   => $count,
            'promedio_pedido' => $count > 0 ? round($suma / $count, 2) : 0,
        ];
    }

    private function pct(float $actual, float $anterior): ?float
    {
        if ($anterior == 0) return null;
        return round((($actual - $anterior) / abs($anterior)) * 100, 1);
    }

    private function rangoAnterior(string $periodo, ?string $desde, ?string $hasta): array
    {
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
}
