<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ImagenPerfilSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 1; $i <= 10; $i++) {
            DB::table('imagenes_perfil')->updateOrInsert(
                [
                    'id_imagen'  => $i,
                ],
                [
                    'path'       => "postaurante-imagen-perfil-{$i}",
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
