<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Producto extends Model
{
    use SoftDeletes;
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

    public function insumos()
    {
        return $this->belongsToMany(Insumo::class, 'producto_insumo')
                    ->withPivot('cantidad')
                    ->withTimestamps();
    }
}
