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
        DB::table('rol')->insert([ // Ajusta 'roles' al nombre exacto de tu tabla
        [
            'nombre' => 'Administrador',
            'created_at' => now(),
        ],
        [
            'nombre' => 'Mesero',
            'created_at' => now(),
        ]
    ]);
    }
}
