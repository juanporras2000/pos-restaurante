<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trabajador;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrabajadorController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Trabajador::orderBy('nombre')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre'         => 'required|string|max:120',
            'cargo'          => 'nullable|string|max:80',
            'pago_por_turno' => 'required|integer|min:0',
            'activo'         => 'boolean',
        ]);

        $trabajador = Trabajador::create($data);

        return response()->json($trabajador, 201);
    }

    public function update(Request $request, Trabajador $trabajador): JsonResponse
    {
        $data = $request->validate([
            'nombre'         => 'sometimes|string|max:120',
            'cargo'          => 'nullable|string|max:80',
            'pago_por_turno' => 'sometimes|integer|min:0',
            'activo'         => 'boolean',
        ]);

        $trabajador->update($data);

        return response()->json($trabajador);
    }

    public function destroy(Trabajador $trabajador): JsonResponse
    {
        $trabajador->delete();

        return response()->json(['message' => 'Trabajador eliminado']);
    }
}
