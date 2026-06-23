<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Configuracion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TenantRegistrationService
{
    /**
     * Registra de manera atómica un nuevo Tenant junto con su usuario administrador
     * y sus configuraciones iniciales por defecto.
     */
    public function registrarNuevoTenant(array $datos): User
    {
        return DB::transaction(function () use ($datos) {
            // 1. Crear el tenant (restaurante) con slug único
            $slug = $this->generarSlugUnico($datos['nombre_restaurante']);

            $tenant = Tenant::create([
                'nombre' => $datos['nombre_restaurante'],
                'slug'   => $slug,
            ]);

            // 2. Forzar el tenant_id en el contenedor para que los seeders virtuales operen bajo su contexto
            app()->instance('tenant_id', $tenant->id);

            // 3. Crear el usuario propietario ligado al tenant
            $user = User::create([
                'name'      => $datos['name'],
                'email'     => $datos['email'],
                'password'  => Hash::make($datos['password']),
                'tenant_id' => $tenant->id,
            ]);

            // 4. Sembrar datos iniciales del tenant (configuraciones por defecto)
            $this->seedTenantDefaults($tenant);

            return $user;
        });
    }

    /**
     * Genera un slug amigable y único para el tenant, resolviendo colisiones numéricamente.
     */
    private function generarSlugUnico(string $nombre): string
    {
        $slug = Str::slug($nombre);
        $baseSlug = $slug;
        $i = 1;

        while (Tenant::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $i;
            $i++;
        }

        return $slug;
    }

    /**
     * Crea los datos mínimos que necesita un tenant recién creado.
     */
    private function seedTenantDefaults(Tenant $tenant): void
    {
        Configuracion::set('recargo_domicilio',  0,               'Recargo fijo (en pesos) que se suma al costo de todo pedido a domicilio.');
        Configuracion::set('hora_cierre',        5,               'Hora (0-23) a la que se cierra la jornada del día anterior.');
        Configuracion::set('nombre_negocio',     $tenant->nombre, 'Nombre del negocio que aparece en los recibos.');
        Configuracion::set('telefono_negocio',   '',              'Teléfono de contacto que aparece en los recibos.');
        Configuracion::set('direccion_negocio',  '',              'Dirección del negocio que aparece en los recibos.');
    }
}
