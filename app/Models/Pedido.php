<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\PedidoDetalle;
use App\Models\Pago;

class Pedido extends Model
{
     protected $fillable = [
        'user_id',
        'tipo',
        'numero_mesa',
        'direccion',
        'total',
        'estado'
    ];
        public function detalles()
    {
        return $this->hasMany(PedidoDetalle::class);
    }

    public function pago()
    {
        return $this->hasOne(Pago::class);
    }
}

