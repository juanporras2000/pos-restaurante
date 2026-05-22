<?php

namespace Database\Seeders;


use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PerfilSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('perfil')->insert([
            'nombre'        => 'Administrador',
            'pin'           => Hash::make('1234'),
            'id_imagen'     => 1,
            'id_user'       => 1,
            'id_rol'        => 1,
            'created_at'    => now(),
            'updated_at'    => now(),
            'tenant_id'     => 1,
        ]);
    }
}
