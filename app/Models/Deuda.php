<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\BelongsToTenant;

class Deuda extends Model
{
    use BelongsToTenant;

    protected $table = 'deudas';

    protected $fillable = [
        'tenant_id',
        'trabajador_id',
        'tipo',
        'concepto',
        'monto_total',
        'saldo',
        'fecha',
        'observaciones',
    ];

    protected $casts = [
        'monto_total' => 'integer',
        'saldo'       => 'integer',
        'fecha'       => 'date:Y-m-d',
    ];

    protected $appends = ['estado'];

    public function trabajador(): BelongsTo
    {
        return $this->belongsTo(Trabajador::class);
    }

    public function abonos(): HasMany
    {
        return $this->hasMany(DeudaAbono::class);
    }

    public function getEstadoAttribute(): string
    {
        return $this->saldo <= 0 ? 'pagada' : 'pendiente';
    }
}
