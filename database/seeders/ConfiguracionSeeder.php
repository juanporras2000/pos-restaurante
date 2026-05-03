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
            'Recargo fijo (en pesos) que se suma al costo de todo producto a domicilio.'
        );
    }
}
