<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Insumo;
use App\Http\Requests\InsumoRequest;
use Illuminate\Http\Request;

class InsumoController extends Controller
{
    public function index()
    {
        return response()->json(Insumo::orderBy('nombre')->get());
    }

    public function store(InsumoRequest $request)
    {
        $insumo = Insumo::create([
            'nombre'         => $request->nombre,
            'unidad_medida'  => $request->unidad_medida,
            'stock_actual'   => $request->stock_actual  ?? 0,
            'stock_minimo'   => $request->stock_minimo  ?? 0,
            'costo_unitario' => $request->costo_unitario ?? 0,
        ]);

        return response()->json($insumo, 201);
    }

    public function update(InsumoRequest $request, $id)
    {
        $insumo = Insumo::findOrFail($id);

        $insumo->update([
            'nombre'         => $request->nombre,
            'unidad_medida'  => $request->unidad_medida,
            'stock_actual'   => $request->stock_actual  ?? $insumo->stock_actual,
            'stock_minimo'   => $request->stock_minimo  ?? $insumo->stock_minimo,
            'costo_unitario' => $request->has('costo_unitario')
                                    ? $request->costo_unitario
                                    : $insumo->costo_unitario,
        ]);

        return response()->json($insumo);
    }

    public function destroy($id)
    {
        $insumo = Insumo::findOrFail($id);

        // Verificar uso en producto_insumo (legacy) Y en receta_detalles (nuevo)
        $enUso = $insumo->productos()->exists()
              || $insumo->recetaDetalles()->exists();

        if ($enUso) {
            return response()->json([
                'error' => 'No se puede eliminar: el insumo está en uso en una o más recetas de productos.',
            ], 409);
        }

        $insumo->delete();

        return response()->json(['mensaje' => 'Insumo eliminado correctamente']);
    }
}
