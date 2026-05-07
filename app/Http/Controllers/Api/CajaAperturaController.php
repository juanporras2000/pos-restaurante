<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CajaApertura;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CajaAperturaController extends Controller
{
    public function show(string $fecha)
    {
        $apertura = CajaApertura::where('fecha', $fecha)->first();
        return response()->json($apertura);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'fecha' => 'required|date_format:Y-m-d',
            'monto' => 'required|numeric|min:0',
            'nota'  => 'nullable|string|max:500',
        ]);

        $hoy = Carbon::now('America/Bogota')->toDateString();
        if ($data['fecha'] !== $hoy) {
            return response()->json(['message' => 'Solo se puede registrar la base de apertura para el día actual.'], 422);
        }

        $apertura = CajaApertura::updateOrCreate(
            ['fecha' => $data['fecha']],
            [
                'monto'   => $data['monto'],
                'nota'    => $data['nota'] ?? null,
                'user_id' => auth()->id(),
            ]
        );

        return response()->json($apertura);
    }
}
