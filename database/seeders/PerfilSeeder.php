<?php

namespace Database\Seeders;


use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PerfilSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('perfil')->insert([
            'nombre'        => 'Gonzalo Taborda',
            'pin'           => 1234,
            'imagen_perfil' => 'admin.png',
            'id_user'       => 1,
            'id_rol'        => 1,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        // Registro 2
        DB::table('perfil')->insert([
            'nombre'        => 'Juan José',
            'pin'           => 4321,
            'imagen_perfil' => 'mesero.png',
            'id_user'       => 1,
            'id_rol'        => 2,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }
}
