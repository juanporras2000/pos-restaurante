<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class Configuracion extends Model
{
    use BelongsToTenant;

    protected $table = 'configuraciones';

    protected $fillable = ['clave', 'valor', 'descripcion', 'tenant_id'];

    public static function get(string $clave, mixed $default = null): mixed
    {
        $registro = static::where('clave', $clave)->first();
        return $registro ? $registro->valor : $default;
    }

    public static function set(string $clave, mixed $valor, string $descripcion = ''): void
    {
        static::updateOrCreate(
            ['clave' => $clave],
            ['valor' => $valor, 'descripcion' => $descripcion]
        );
    }

    public static function cacheKey(string $clave, ?string $tenantId = null): string
    {
        // Si no se pasa un tenant_id, intentamos resolverlo dinámicamente del contenedor
        $tenant = $tenantId ?? (app()->has('tenant_id') ? app('tenant_id') : 'global');

        return "cfg_{$tenant}_{$clave}";
    }
}
