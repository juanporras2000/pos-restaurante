<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Insumo;
use Illuminate\Http\Request;

class InsumoController extends Controller
{
    public function index()
    {
        return response()->json(Insumo::orderBy('nombre')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'        => 'required|string|max:255',
            'unidad_medida' => 'required|string|max:50',
            'stock_actual'  => 'nullable|numeric|min:0',
            'stock_minimo'  => 'nullable|numeric|min:0',
        ]);

        $insumo = Insumo::create([
            'nombre'        => $request->nombre,
            'unidad_medida' => $request->unidad_medida,
            'stock_actual'  => $request->stock_actual ?? 0,
            'stock_minimo'  => $request->stock_minimo ?? 0,
        ]);

        return response()->json($insumo, 201);
    }

    public function update(Request $request, $id)
    {
        $insumo = Insumo::findOrFail($id);

        $request->validate([
            'nombre'        => 'required|string|max:255',
            'unidad_medida' => 'required|string|max:50',
            'stock_actual'  => 'nullable|numeric|min:0',
            'stock_minimo'  => 'nullable|numeric|min:0',
        ]);

        $insumo->update([
            'nombre'        => $request->nombre,
            'unidad_medida' => $request->unidad_medida,
            'stock_actual'  => $request->stock_actual ?? $insumo->stock_actual,
            'stock_minimo'  => $request->stock_minimo ?? $insumo->stock_minimo,
        ]);

        return response()->json($insumo);
    }

    public function destroy($id)
    {
        $insumo = Insumo::findOrFail($id);

        // Verificar que no esté en uso en ninguna receta
        if ($insumo->productos()->exists()) {
            return response()->json([
                'error' => 'No se puede eliminar: el insumo está en uso en una o más recetas de productos.',
            ], 409);
        }

        $insumo->delete();

        return response()->json(['mensaje' => 'Insumo eliminado correctamente']);
    }
}
