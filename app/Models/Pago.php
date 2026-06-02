<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\BelongsToTenant;

class Pago extends Model
{
    use BelongsToTenant;

    protected $table = 'pagos';

    protected $fillable = [
        'pedido_id',
        'total',
        'recibido',
        'cambio',
        'metodo_pago',
        'tenant_id',
    ];

    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class);
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(PagoDetalle::class);
    }
}
