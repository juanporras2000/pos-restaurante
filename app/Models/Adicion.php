<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Adicion extends Model
{
    protected $table = 'adiciones';

    protected $fillable = ['nombre', 'precio', 'activo'];

    protected $casts = [
        'precio'  => 'float',
        'activo'  => 'boolean',
    ];
}
