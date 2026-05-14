<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    protected $fillable = ['nombre', 'slug', 'plan', 'activo', 'configuracion'];

    protected $casts = [
        'activo'        => 'boolean',
        'configuracion' => 'array',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class);
    }

    public function insumos(): HasMany
    {
        return $this->hasMany(Insumo::class);
    }

    public function categorias(): HasMany
    {
        return $this->hasMany(Categoria::class);
    }

    public function adiciones(): HasMany
    {
        return $this->hasMany(Adicion::class);
    }

    public function pedidos(): HasMany
    {
        return $this->hasMany(Pedido::class);
    }

    public function configuraciones(): HasMany
    {
        return $this->hasMany(Configuracion::class);
    }

    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }
}
