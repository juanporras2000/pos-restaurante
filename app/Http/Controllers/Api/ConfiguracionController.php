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
     */
    public function index()
    {
        return response()->json(
            Configuracion::all(['clave', 'valor', 'descripcion'])
        );
    }

    /**
     * Actualiza una o varias claves de configuración.
     * Body: { "recargo_domicilio": 1500 }
     */
    public function update(Request $request)
    {
        $request->validate([
            'recargo_domicilio' => 'sometimes|numeric|min:0',
            'hora_cierre' => 'sometimes|integer|between:0,23',
        ]);

        foreach ($request->only(['recargo_domicilio', 'hora_cierre']) as $clave => $valor) {
            Configuracion::set($clave, $valor);
            // Cache key incluye el tenant para no mezclar configuraciones entre restaurantes
            $tenantId = app()->has('tenant_id') ? app('tenant_id') : 'global';
            Cache::forget("cfg_{$tenantId}_{$clave}");
        }

        return response()->json(['message' => 'Configuración actualizada']);
    }
}
