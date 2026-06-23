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
        $tenantId = app()->has('tenant_id') ? app('tenant_id') : 'global';

        foreach ($datos as $clave => $valor) {
            Configuracion::set($clave, $valor);
            Cache::forget("cfg_{$tenantId}_{$clave}");
        }
    }
}
