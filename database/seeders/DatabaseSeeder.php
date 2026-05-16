<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;


class DatabaseSeeder extends Seeder
{
    // use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            TenantSeeder::class,
            ImagenPefilSeeder::class,
            UserSeeder::class,
            RolSeeder::class,
            PerfilSeeder::class,
            PermisoSeeder::class,
            PerfilPermisoSeeder::class
        ]);


    }
}
