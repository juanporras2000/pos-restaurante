<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ConfiguracionController extends Controller
{
    /**
     * Retorna todas las configuraciones públicas del sistema.
     * Si `nombre_negocio` está vacío, se usa el nombre del tenant del
     * usuario autenticado como valor de fallback (sin persistirlo).
     */
    public function index()
    {
        $configs = Configuracion::all(['clave', 'valor', 'descripcion']);

        $nombreConfig = $configs->firstWhere('clave', 'nombre_negocio');
        $nombreVacio  = !$nombreConfig || trim((string) $nombreConfig->valor) === '';

        if ($nombreVacio) {
            $tenantNombre = auth()->user()?->tenant?->nombre;
            if ($tenantNombre) {
                if ($nombreConfig) {
                    // La clave existe pero está vacía: sobreescribir valor en memoria
                    $nombreConfig->valor = $tenantNombre;
                } else {
                    // La clave no existe aún: agregarla virtualmente
                    $configs->push((object) [
                        'clave'       => 'nombre_negocio',
                        'valor'       => $tenantNombre,
                        'descripcion' => 'Nombre del negocio que aparece en los recibos.',
                    ]);
                }
            }
        }

        return response()->json($configs);
    }

    /**
     * Actualiza una o varias claves de configuración.
     * Body: { "recargo_domicilio": 1500 }
     */
    public function update(Request $request)
    {
        $request->validate([
            'recargo_domicilio'  => 'sometimes|numeric|min:0',
            'hora_cierre'        => 'sometimes|integer|between:0,23',
            'nombre_negocio'     => 'sometimes|string|max:120',
            'telefono_negocio'   => 'sometimes|string|max:30',
            'direccion_negocio'  => 'sometimes|string|max:255',
        ]);

        $claves = ['recargo_domicilio', 'hora_cierre', 'nombre_negocio', 'telefono_negocio', 'direccion_negocio'];

        foreach ($request->only($claves) as $clave => $valor) {
            Configuracion::set($clave, $valor);
            $tenantId = app()->has('tenant_id') ? app('tenant_id') : 'global';
            Cache::forget("cfg_{$tenantId}_{$clave}");
        }

        return response()->json(['message' => 'Configuración actualizada']);
    }
}
