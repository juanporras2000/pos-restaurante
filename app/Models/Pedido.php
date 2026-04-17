<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\PedidoDetalle;
use App\Models\Pago;

class Pedido extends Model
{
    use SoftDeletes;

     protected $fillable = [
        'user_id',
        'tipo',
        'numero_mesa',
        'direccion',
        'total',
        'estado',
        'razon_eliminacion',
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

