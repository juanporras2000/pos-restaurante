<?php

namespace App\Services;

use App\Models\Configuracion;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;

class ConfiguracionService
{
    public function obtenerConfiguraciones()
    {
        $configs = Configuracion::all(['clave', 'valor', 'descripcion']);

        $nombreConfig = $configs->firstWhere('clave', 'nombre_negocio');
        $nombreVacio  = !$nombreConfig || trim((string) $nombreConfig->valor) === '';

        if ($nombreVacio) {
            $tenantNombre = Auth::user()->tenant?->nombre;
            if ($tenantNombre) {
                if ($nombreConfig) {
                    $nombreConfig->valor = $tenantNombre;
                } else {
                    $configs->push((object) [
                        'clave'       => 'nombre_negocio',
                        'valor'       => $tenantNombre,
                        'descripcion' => 'Nombre del negocio que aparece en los recibos.',
                    ]);
                }
            }
        }

        return $configs;
    }

    public function actualizarConfiguraciones(array $datos)
    {
        foreach ($datos as $clave => $valor) {
            // 1. Guardamos en la base de datos
            Configuracion::set($clave, $valor);

            // 2. Obtenemos la llave centralizada del modelo
            $key = Configuracion::cacheKey($clave);

            // 3. Olvidamos la caché de manera segura
            Cache::forget($key);
        }
    }
}
