<?php

namespace Database\Seeders;

use App\Models\Configuracion;
use Illuminate\Database\Seeder;

class ConfiguracionSeeder extends Seeder
{
    public function run(): void
    {
        Configuracion::set(
            'recargo_domicilio',
            0,
            'Recargo fijo (en pesos) que se suma al costo de todo pedido a domicilio.'
        );
        Configuracion::set('nombre_negocio',    'Mi Restaurante', 'Nombre del negocio que aparece en los recibos.');
        Configuracion::set('telefono_negocio',  '',               'Teléfono de contacto que aparece en los recibos.');
        Configuracion::set('direccion_negocio', '',               'Dirección del negocio que aparece en los recibos.');
    }
}
