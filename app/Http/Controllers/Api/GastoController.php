<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gasto;
use App\Services\GastoService;
use Illuminate\Http\Request;

class GastoController extends Controller
{
    // Usamos inyección de dependencias en el constructor mediante propiedades promovidas de PHP 8
    public function __construct(private readonly GastoService $gastoService) {}

    public function index(Request $request)
    {
        $resultado = $this->gastoService->obtenerGastosPorFecha($request->query('fecha'));

        return response()->json($resultado);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'concepto' => 'required|string|max:255',
            'tipo'     => 'required|in:insumos,gasolina,servicios,otro',
            'monto'    => 'required|numeric|min:0.01',
            'nota'     => 'nullable|string|max:500',
        ]);

        $gasto = $this->gastoService->registrarGasto($data);

        return response()->json($gasto, 201);
    }

    public function update(Request $request, Gasto $gasto)
    {
        $data = $request->validate([
            'concepto' => 'required|string|max:255',
            'tipo'     => 'required|in:insumos,gasolina,servicios,otro',
            'monto'    => 'required|numeric|min:0.01',
            'nota'     => 'nullable|string|max:500',
        ]);

        try {
            $gastoActualizado = $this->gastoService->actualizarGasto($gasto, $data);
            return response()->json($gastoActualizado);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function destroy(Gasto $gasto)
    {
        try {
            $this->gastoService->eliminarGasto($gasto);
            return response()->json(['message' => 'Gasto eliminado']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
