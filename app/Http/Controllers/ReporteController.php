<?php

namespace App\Http\Controllers;

use App\Services\ReporteService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    public function __construct(private readonly ReporteService $reporteService) {}

    public function ventas(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);

        $resultado = $this->reporteService->obtenerVentasSerie(
            $desde,
            $hasta,
            $request->query('periodo', 'dia'),
            $request->query('desde'),
            $request->query('hasta')
        );

        return response()->json($resultado);
    }

    public function ventasPorFecha(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);

        $resultado = $this->reporteService->obtenerVentasPorFecha($desde, $hasta);

        return response()->json($resultado);
    }

    public function productosTop(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);

        $resultado = $this->reporteService->obtenerProductosTop(
            $desde,
            $hasta,
            (int) $request->query('limit', 10)
        );

        return response()->json($resultado);
    }

    public function ingresos(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);

        $resultado = $this->reporteService->obtenerResumenIngresos($desde, $hasta);

        return response()->json($resultado);
    }

    public function ganancias(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);

        $resultado = $this->reporteService->obtenerGananciaEstimada($desde, $hasta);

        return response()->json($resultado);
    }

    public function metodosPago(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);

        $resultado = $this->reporteService->obtenerMetodosPago($desde, $hasta);

        return response()->json($resultado);
    }

    public function stockInsumos(Request $request)
    {
        $soloAlertas = filter_var($request->query('alertas', false), FILTER_VALIDATE_BOOLEAN);

        $resultado = $this->reporteService->obtenerEstadoStockInsumos($soloAlertas);

        return response()->json($resultado);
    }

    public function insumosTop(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);

        $resultado = $this->reporteService->obtenerInsumosTop(
            $desde,
            $hasta,
            (int) $request->query('limit', 10)
        );

        return response()->json($resultado);
    }

    public function gastosPorPeriodo(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);

        $resultado = $this->reporteService->obtenerGastosResumen(
            $desde,
            $hasta,
            $request->query('periodo', 'dia'),
            $request->query('desde'),
            $request->query('hasta')
        );

        return response()->json($resultado);
    }

    public function tipoPedido(Request $request)
    {
        [$desde, $hasta] = $this->rango($request);

        $resultado = $this->reporteService->obtenerDistribuciónTipoPedido($desde, $hasta);

        return response()->json($resultado);
    }

    public function diario()
    {
        $resultado = $this->reporteService->obtenerReporteDiarioLegacy();

        return response()->json($resultado);
    }

    /**
     * Helper de transporte HTTP: Extrae y normaliza el rango primario de fechas solicitado.
     */
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
}
