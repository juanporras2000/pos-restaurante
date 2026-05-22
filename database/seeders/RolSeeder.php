<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('rol')->insert([
        [
            'nombre' => 'Administrador',
            'created_at' => now(),
        ],
        [
            'nombre' => 'Mesero',
            'created_at' => now(),
        ],
        [
            'nombre' => 'Cocinero',
            'created_at' => now(),
        ],
        [
            'nombre' => 'Cajero',
            'created_at' => now(),
        ],
        [
            'nombre' => 'Domiciliario',
            'created_at' => now(),
        ]
    ]);
    }
}
