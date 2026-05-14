<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class Adicion extends Model
{
    use BelongsToTenant;

    protected $table = 'adiciones';

    protected $fillable = ['nombre', 'precio', 'activo', 'tenant_id'];

    protected $casts = [
        'precio'  => 'float',
        'activo'  => 'boolean',
    ];
}
