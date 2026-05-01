<?php

namespace App\Observers;

use App\Models\Insumo;
use App\Models\Producto;
use App\Models\RecetaDetalle;
use Illuminate\Support\Facades\DB;

/**
 * InsumoObserver
 *
 * Responsabilidad: mantener sincronizado el campo `costo_calculado` de todos
 * los productos cuya receta incluya este insumo, cada vez que cambia
 * `costo_unitario`.
 *
 * Estrategia: actualización en caliente vía Eloquent (sin job/queue).
 * Para SaaS de alto volumen, mover la lógica a un Job con `dispatchAfterResponse`.
 */
class InsumoObserver
{
    public function updated(Insumo $insumo): void
    {
        // Solo actuar si cambió el costo — evita recálculos innecesarios
        if (! $insumo->wasChanged('costo_unitario')) {
            return;
        }

        // 1. Obtener IDs de productos afectados a través de receta_detalles → recetas
        $productoIds = RecetaDetalle::where('insumo_id', $insumo->id)
            ->join('recetas', 'receta_detalles.receta_id', '=', 'recetas.id')
            ->pluck('recetas.producto_id')
            ->unique()
            ->values();

        if ($productoIds->isEmpty()) {
            return;
        }

        // 2. Recalcular y persistir costo_calculado para cada producto afectado.
        //    Se carga la receta completa para usar el accessor getCostoAttribute().
        Producto::with('receta.detalles.insumo')
            ->whereIn('id', $productoIds)
            ->get()
            ->each(function (Producto $producto) {
                // Actualizar silenciosamente (sin disparar más observers)
                DB::table('productos')
                    ->where('id', $producto->id)
                    ->update([
                        'costo_calculado' => $producto->costo,
                        'updated_at'      => now(),
                    ]);
            });
    }
}
