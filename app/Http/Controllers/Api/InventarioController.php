<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Insumo;
use App\Models\MovimientoInventario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventarioController extends Controller
{
    /**
     * GET /api/inventario/movimientos?insumo_id=&per_page=
     * Historial de movimientos, filtrable por insumo.
     */
    public function movimientos(Request $request)
    {
        $query = MovimientoInventario::with(['insumo:id,nombre,unidad_medida', 'user:id,name', 'pedido:id'])
            ->orderByDesc('created_at');

        if ($request->filled('insumo_id')) {
            $query->where('insumo_id', $request->insumo_id);
        }

        return response()->json($query->paginate($request->integer('per_page', 50)));
    }

    /**
     * POST /api/inventario/ajuste
     * Entrada o ajuste manual de stock.
     * Body: { insumo_id, tipo: 'entrada'|'ajuste', cantidad, motivo? }
     */
    public function ajuste(Request $request)
    {
        $request->validate([
            'insumo_id' => 'required|exists:insumos,id',
            'tipo'      => 'required|in:entrada,ajuste',
            'cantidad'  => 'required|numeric|min:0.01',
            'motivo'    => 'nullable|string|max:255',
        ]);

        $insumo = DB::transaction(function () use ($request) {
            $insumo = Insumo::lockForUpdate()->findOrFail($request->insumo_id);
            $stockAntes = $insumo->stock_actual;

            if ($request->tipo === 'entrada') {
                $insumo->increment('stock_actual', $request->cantidad);
            } else {
                // ajuste: sobreescribir con la cantidad indicada
                $insumo->update(['stock_actual' => $request->cantidad]);
            }

            $insumo->refresh();

            MovimientoInventario::create([
                'insumo_id'     => $insumo->id,
                'user_id'       => auth()->id(),
                'pedido_id'     => null,
                'tipo'          => $request->tipo,
                'cantidad'      => abs($insumo->stock_actual - $stockAntes),
                'stock_antes'   => $stockAntes,
                'stock_despues' => $insumo->stock_actual,
                'motivo'        => $request->motivo ?? ($request->tipo === 'entrada' ? 'Entrada manual' : 'Ajuste manual'),
            ]);

            return $insumo;
        });

        return response()->json($insumo);
    }

    /**
     * GET /api/inventario/alertas
     * Devuelve insumos con stock_actual <= stock_minimo (y stock_minimo > 0).
     */
    public function alertas()
    {
        $insumos = Insumo::whereColumn('stock_actual', '<=', 'stock_minimo')
            ->where('stock_minimo', '>', 0)
            ->orderBy('nombre')
            ->get();

        return response()->json($insumos);
    }
}
