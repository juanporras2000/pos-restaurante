<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConversacionEstado extends Model
{
    protected $table = 'conversacion_estados';

    protected $fillable = [
        'telefono',
        'estado',
        'pedido_json',
    ];

    protected $casts = [
        'pedido_json' => 'array',
    ];
}
