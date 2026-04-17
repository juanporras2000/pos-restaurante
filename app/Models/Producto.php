<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
     protected $fillable = [
        'nombre',
        'precio',
        'activo',
        'categoria_id',
        'imagen'
    ];
        public function detalles()
    {
        return $this->hasMany(PedidoDetalle::class);
    }

        public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }
}
