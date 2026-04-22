<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversacion extends Model
{
    protected $table = 'conversaciones';

    protected $fillable = [
        'telefono',
        'mensaje',
        'respuesta',
        'estado',
        'carrito',
        'pedido_activo_id',
    ];

    protected $casts = [
        'carrito' => 'array',
    ];

    /**
     * Inicializa el carrito vacío si no existe.
     */
    public function getCarritoAttribute($value)
    {
        return $value ? json_decode($value, true) : [
            'productos' => [],
            'total' => 0
        ];
    }
}
