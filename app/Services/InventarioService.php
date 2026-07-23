<?php

namespace App\Services;

use App\Models\Insumo;
use App\Models\MovimientoInventario;
use Illuminate\Support\Facades\DB;

class InventarioService
{
    /**
     * Obtiene los movimientos del inventario paginados y filtrados.
     */
    public function obtenerMovimientos(?string $insumoId, int $perPage = 50)
    {
        $query = MovimientoInventario::with(['insumo:id,nombre,unidad_medida', 'user:id,name', 'pedido:id'])
            ->orderByDesc('created_at');

        if (!empty($insumoId)) {
            $query->where('insumo_id', $insumoId);
        }

        return $query->paginate($perPage);
    }

    /**
     * Procesa una entrada o un ajuste manual de inventario de forma transaccional.
     */
    public function procesarAjuste(array $datos, int $userId)
    {
        return DB::transaction(function () use ($datos, $userId) {
            $insumo = Insumo::lockForUpdate()->findOrFail($datos['insumo_id']);
            $stockAntes = $insumo->stock_actual;

            if ($datos['tipo'] === 'entrada') {
                $insumo->increment('stock_actual', $datos['cantidad']);
            } else {
                $insumo->update(['stock_actual' => $datos['cantidad']]);
            }

            $insumo->refresh();

            MovimientoInventario::create([
                'insumo_id'     => $insumo->id,
                'user_id'       => $userId,
                'pedido_id'     => null,
                'tipo'          => $datos['tipo'],
                'cantidad'      => abs($insumo->stock_actual - $stockAntes),
                'stock_antes'   => $stockAntes,
                'stock_despues' => $insumo->stock_actual,
                'motivo'        => $datos['motivo'] ?? ($datos['tipo'] === 'entrada' ? 'Entrada manual' : 'Ajuste manual'),
            ]);

            return $insumo;
        });
    }

    /**
     * Obtiene los insumos que están por debajo del stock mínimo.
     */
    public function obtenerAlertasStock()
    {
        return Insumo::whereColumn('stock_actual', '<=', 'stock_minimo')
            ->where('stock_minimo', '>', 0)
            ->orderBy('nombre')
            ->get();
    }
}
