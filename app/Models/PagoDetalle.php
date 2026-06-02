<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\BelongsToTenant;

class PagoDetalle extends Model
{
    use BelongsToTenant;

    protected $table = 'pago_detalles';

    protected $fillable = [
        'pago_id',
        'metodo_pago',
        'monto',
        'recibido',
        'cambio',
        'tenant_id',
    ];

    public function pago(): BelongsTo
    {
        return $this->belongsTo(Pago::class);
    }
}