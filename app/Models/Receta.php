<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Receta extends Model
{
    protected $fillable = ['producto_id', 'tenant_id'];

    // ─── Relaciones ───────────────────────────────────────────────────────────

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    /**
     * Ingredientes de la receta.
     * Siempre cargar con ->with('detalles.insumo') para evitar N+1.
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(RecetaDetalle::class);
    }
}
