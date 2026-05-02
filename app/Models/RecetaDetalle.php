<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecetaDetalle extends Model
{
    protected $fillable = ['receta_id', 'insumo_id', 'cantidad'];

    protected $casts = [
        'cantidad' => 'float',
    ];

    // ─── Relaciones ───────────────────────────────────────────────────────────

    public function receta(): BelongsTo
    {
        return $this->belongsTo(Receta::class);
    }

    public function insumo(): BelongsTo
    {
        return $this->belongsTo(Insumo::class);
    }
}
