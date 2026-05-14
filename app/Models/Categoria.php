<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class Categoria extends Model
{
    use BelongsToTenant;

   protected $table = 'categorias';

    protected $fillable = ['nombre', 'tenant_id'];
    public function productos()
{
    return $this->hasMany(Producto::class);
}
}
