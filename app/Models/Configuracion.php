<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    protected $table = 'configuraciones';

    protected $fillable = ['clave', 'valor', 'descripcion'];

    /**
     * Obtiene el valor de una configuración.
     * Si no existe, retorna $default.
     */
    public static function get(string $clave, mixed $default = null): mixed
    {
        $registro = static::where('clave', $clave)->first();

        return $registro ? $registro->valor : $default;
    }

    /**
     * Crea o actualiza una configuración.
     */
    public static function set(string $clave, mixed $valor, string $descripcion = ''): void
    {
        static::updateOrCreate(
            ['clave' => $clave],
            ['valor' => $valor, 'descripcion' => $descripcion]
        );
    }
}
