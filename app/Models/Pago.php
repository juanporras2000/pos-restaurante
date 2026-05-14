<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
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

    // Relación
    public function pedido()
    {
        return $this->belongsTo(Pedido::class);
    }
}