<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ImagenPefilSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('imagenes_perfil')->insert([
            'id_imagen'            => 1,
            'path'          => 'gonzalo-taborda-profile',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        DB::table('imagenes_perfil')->insert([
            'id_imagen'            => 2,
            'path'          => 'juan-jose-profile',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }
}
