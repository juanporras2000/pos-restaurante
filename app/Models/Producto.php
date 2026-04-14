<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
     protected $fillable = [
        'nombre',
        'precio',
        'activo'
    ];
        public function detalles()
    {
        return $this->hasMany(PedidoDetalle::class);
    }
}
