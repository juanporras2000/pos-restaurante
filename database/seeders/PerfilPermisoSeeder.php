<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Perfil;
use App\Models\Permiso;
use Illuminate\Support\Facades\DB;

class PerfilPermisoSeeder extends Seeder
{
    public function run(): void
    {

        $perfilesIds = DB::table('perfil')->pluck('id_perfil')->toArray();


        $permisosIds = DB::table('permiso')->pluck('id_permiso')->toArray();


        $insertarPivote = [];

        foreach ($perfilesIds as $idPerfil) {
            foreach ($permisosIds as $idPermiso) {
                $insertarPivote[] = [
                    'id_perfil'  => $idPerfil,
                    'id_permiso' => $idPermiso,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        DB::table('perfil_permiso')->insertOrIgnore($insertarPivote);
    }
}
