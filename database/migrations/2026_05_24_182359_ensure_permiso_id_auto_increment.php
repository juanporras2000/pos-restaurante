<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Crea la secuencia enlazada a la columna (IF NOT EXISTS es idempotente)
        DB::statement('CREATE SEQUENCE IF NOT EXISTS permiso_id_permiso_seq OWNED BY permiso.id_permiso');

        // Asigna la secuencia como valor por defecto de la columna
        DB::statement("ALTER TABLE permiso ALTER COLUMN id_permiso SET DEFAULT nextval('permiso_id_permiso_seq')");

        // Sincroniza la secuencia al MAX id existente para evitar colisiones con el seeder
        DB::statement("SELECT setval('permiso_id_permiso_seq', COALESCE((SELECT MAX(id_permiso) FROM permiso), 0) + 1, false)");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE permiso ALTER COLUMN id_permiso DROP DEFAULT');
        DB::statement('DROP SEQUENCE IF EXISTS permiso_id_permiso_seq');
    }
};
