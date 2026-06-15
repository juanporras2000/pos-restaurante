<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermisoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permisos = [
            ['id_permiso' => 1, 'descripcion' => 'Pedidos'],
            ['id_permiso' => 2, 'descripcion' => 'Productos'],
            ['id_permiso' => 3, 'descripcion' => 'Reportes'],
            ['id_permiso' => 4, 'descripcion' => 'Gastos y apertura de caja'],
            ['id_permiso' => 5, 'descripcion' => 'Insumos'],
            ['id_permiso' => 6, 'descripcion' => 'Configuración'],
            ['id_permiso' => 7, 'descripcion' => 'Historial del día'],
            ['id_permiso' => 8, 'descripcion' => 'Nómina'],
        ];

        foreach ($permisos as $permiso) {
            DB::table('permiso')->updateOrInsert([
                'id_permiso'  => $permiso['id_permiso'],
                'descripcion' => $permiso['descripcion'],
                'created_at'  => now(),
                'updated_at'  => now()
            ]);
        }
    }
}
