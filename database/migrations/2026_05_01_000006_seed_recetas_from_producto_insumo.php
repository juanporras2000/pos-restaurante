<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Migración de datos: transporta el contenido existente de producto_insumo
 * hacia el nuevo esquema recetas / receta_detalles.
 *
 * Es idempotente: si ya existen recetas para un producto, las omite.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('producto_insumo') || ! Schema::hasTable('recetas')) {
            return;
        }

        // Agrupar por producto_id
        $grupos = DB::table('producto_insumo')
            ->select('producto_id', DB::raw('array_agg(insumo_id) as insumos_ids'))
            ->groupBy('producto_id')
            ->get();

        foreach ($grupos as $grupo) {
            // Saltar si ya existe receta para este producto (idempotencia)
            $existeReceta = DB::table('recetas')
                ->where('producto_id', $grupo->producto_id)
                ->exists();

            if ($existeReceta) {
                continue;
            }

            $recetaId = DB::table('recetas')->insertGetId([
                'producto_id' => $grupo->producto_id,
                'tenant_id'   => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            $detalles = DB::table('producto_insumo')
                ->where('producto_id', $grupo->producto_id)
                ->get();

            foreach ($detalles as $detalle) {
                DB::table('receta_detalles')->insertOrIgnore([
                    'receta_id'  => $recetaId,
                    'insumo_id'  => $detalle->insumo_id,
                    'cantidad'   => $detalle->cantidad,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        // No revertir datos - el rollback de las migraciones 3 y 4 borrará las tablas
    }
};
