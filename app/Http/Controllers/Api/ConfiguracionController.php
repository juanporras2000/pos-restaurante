<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ConfiguracionService;
use Illuminate\Http\Request;


class ConfiguracionController extends Controller
{

    public function __construct(private readonly ConfiguracionService $configService) {}


    public function index()
    {
        $configs = $this->configService->obtenerConfiguraciones();

        return response()->json($configs);
    }


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

        // Filtramos solo las claves permitidas y se las pasamos al servicio
        $datosAActualizar = $request->only($claves);

        $this->configService->actualizarConfiguraciones($datosAActualizar);

        return response()->json(['message' => 'Configuración actualizada']);
    }
}
