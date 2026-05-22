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
        DB::table('imagenes_perfil')->updateOrInsert([
            'id_imagen'     => 1,
            'path'          => 'perfil-001',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }
}
