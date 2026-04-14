<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    protected $table = 'pagos';

    protected $fillable = [
        'pedido_id',
        'total',
        'recibido',
        'cambio',
    ];

    // Relación
    public function pedido()
    {
        return $this->belongsTo(Pedido::class);
    }
}