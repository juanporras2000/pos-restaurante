<?php

namespace Database\Seeders;

use App\Models\Configuracion;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Crea el tenant de desarrollo y asigna todos los registros existentes
 * (que tienen tenant_id = NULL) a ese tenant.
 *
 * Ejecutar SOLO en desarrollo / entornos de prueba.
 * En producción cada tenant se crea al registrarse desde el formulario.
 */
class TenantSeeder extends Seeder
{
    public function run(): void
    {
        // Crear (o recuperar) el tenant de desarrollo
        $tenant = Tenant::firstOrCreate(
            ['slug' => 'rancho-dev'],
            [
                'nombre' => 'El Rancho (Desarrollo)',
                'plan'   => 'gratis',
                'activo' => true,
            ]
        );

        $id = $tenant->id;

        // Registrar en el contenedor para que el trait BelongsToTenant funcione
        app()->instance('tenant_id', $id);

        // Asignar tenant_id a todos los registros huérfanos en cada tabla de negocio
        $tablas = [
            'users',
            'productos',
            'insumos',
            'categorias',
            'adiciones',
            'pedidos',
            'pagos',
            'gastos',
            'caja_aperturas',
            'movimientos_inventario',
            'configuraciones',
            'perfil',
        ];

        foreach ($tablas as $tabla) {
            DB::table($tabla)
                ->whereNull('tenant_id')
                ->update(['tenant_id' => $id]);
        }

        $this->command->info("Tenant '{$tenant->nombre}' (id={$id}) asignado a todos los registros huérfanos.");
    }
}
