<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Services\NominaService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AsistenciaController extends Controller
{
    public function __construct(private readonly NominaService $nominaService) {}

    public function porFecha(Request $request): JsonResponse
    {
        $fecha = $request->query('fecha', Carbon::today('America/Bogota')->toDateString());

        $asistencias = Asistencia::with('trabajador')
            ->where('fecha', $fecha)
            ->get();

        return response()->json($asistencias);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'trabajador_id' => 'required|exists:trabajadores,id',
            'fecha'         => 'required|date_format:Y-m-d',
        ]);

        $asistencia = Asistencia::firstOrCreate(
            ['trabajador_id' => $data['trabajador_id'], 'fecha' => $data['fecha']],
        );

        return response()->json($asistencia->load('trabajador'), 201);
    }

    public function destroy(Asistencia $asistencia): JsonResponse
    {
        $asistencia->delete();

        return response()->json(['message' => 'Asistencia eliminada']);
    }

    public function resumen(Request $request): JsonResponse
    {
        $request->validate([
            'inicio' => 'required|date_format:Y-m-d',
            'fin'    => 'required|date_format:Y-m-d|after_or_equal:inicio',
        ]);

        $resumen = $this->nominaService->resumenEnRango(
            $request->query('inicio'),
            $request->query('fin')
        );

        return response()->json($resumen);
    }
}
