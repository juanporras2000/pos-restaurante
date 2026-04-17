<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Insumo extends Model
{
    protected $fillable = [
        'nombre',
        'unidad_medida',
        'stock_actual',
        'stock_minimo',
    ];

    public function productos()
    {
        return $this->belongsToMany(Producto::class, 'producto_insumo')
                    ->withPivot('cantidad')
                    ->withTimestamps();
    }
}
