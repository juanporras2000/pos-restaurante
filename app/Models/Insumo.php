<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Insumo extends Model
{
    protected $fillable = [
        'nombre',
        'unidad_medida',
        'stock_actual',
        'stock_minimo',
        'costo_unitario',
        'tenant_id',
    ];

    protected $casts = [
        'costo_unitario' => 'float',
        'stock_actual'   => 'float',
        'stock_minimo'   => 'float',
    ];

    // ─── Relaciones ───────────────────────────────────────────────────────────

    /** Relación legacy con producto_insumo */
    public function productos(): BelongsToMany
    {
        return $this->belongsToMany(Producto::class, 'producto_insumo')
                    ->withPivot('cantidad')
                    ->withTimestamps();
    }

    /**
     * Detalles de receta que usan este insumo.
     * El Observer lo usa para recalcular costos al cambiar costo_unitario.
     */
    public function recetaDetalles(): HasMany
    {
        return $this->hasMany(RecetaDetalle::class);
    }
}
