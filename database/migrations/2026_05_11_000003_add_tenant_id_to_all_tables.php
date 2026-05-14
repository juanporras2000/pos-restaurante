<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ---------------------------------------------------------------
        // TABLAS QUE YA TIENEN tenant_id (sin FK): agregar constraint
        // ---------------------------------------------------------------

        // Antes de añadir el FK, los registros existentes deben tener tenant_id.
        // Los registros sin tenant quedan fuera del scope de cualquier tenant
        // (el global scope no filtrará lo que no tiene tenant_id asignado
        // mientras sea nullable — el NOT NULL lo forzamos tras los seeders).

        Schema::table('productos', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        Schema::table('insumos', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        Schema::table('recetas', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        // ---------------------------------------------------------------
        // TABLAS QUE NO TIENEN tenant_id: agregar columna + FK
        // ---------------------------------------------------------------

        // categorias
        Schema::table('categorias', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->nullable()->after('id')->index();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        // adiciones
        Schema::table('adiciones', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->nullable()->after('id')->index();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        // configuraciones: cambia unique(clave) → unique(tenant_id, clave)
        Schema::table('configuraciones', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->nullable()->after('id')->index();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });
        // Quitar unique constraint existente de 'clave' y crear uno compuesto
        DB::statement('ALTER TABLE configuraciones DROP CONSTRAINT IF EXISTS configuraciones_clave_unique');
        DB::statement('ALTER TABLE configuraciones ADD CONSTRAINT configuraciones_tenant_clave_unique UNIQUE (tenant_id, clave)');

        // pedidos — complementa user_id (quién tomó el pedido) con tenant_id (a qué restaurante pertenece)
        Schema::table('pedidos', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->nullable()->after('id')->index();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        // pagos — acceso directo para reportes sin join a pedidos
        Schema::table('pagos', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->nullable()->after('id')->index();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        // gastos
        Schema::table('gastos', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->nullable()->after('id')->index();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        // caja_aperturas: cambia unique(fecha) → unique(tenant_id, fecha)
        Schema::table('caja_aperturas', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->nullable()->after('id')->index();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });
        DB::statement('ALTER TABLE caja_aperturas DROP CONSTRAINT IF EXISTS caja_aperturas_fecha_unique');
        DB::statement('ALTER TABLE caja_aperturas ADD CONSTRAINT caja_aperturas_tenant_fecha_unique UNIQUE (tenant_id, fecha)');

        // movimientos_inventario
        Schema::table('movimientos_inventario', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->nullable()->after('id')->index();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        // rol — cada restaurante puede tener sus propios roles
        Schema::table('rol', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->nullable()->after('id_rol')->index();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        // perfil
        Schema::table('perfil', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->nullable()->after('id_perfil')->index();
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        // Quitar FKs de tablas que ya tenían tenant_id
        Schema::table('productos', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
        });
        Schema::table('insumos', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
        });
        Schema::table('recetas', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
        });

        // Quitar columna + FK de tablas nuevas
        foreach (['categorias', 'adiciones', 'configuraciones', 'pedidos', 'pagos',
                  'gastos', 'caja_aperturas', 'movimientos_inventario'] as $tabla) {
            Schema::table($tabla, function (Blueprint $table) {
                $table->dropForeign(['tenant_id']);
                $table->dropColumn('tenant_id');
            });
        }

        Schema::table('rol', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn('tenant_id');
        });

        Schema::table('perfil', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn('tenant_id');
        });

        // Restaurar uniques originales
        DB::statement('ALTER TABLE configuraciones DROP CONSTRAINT IF EXISTS configuraciones_tenant_clave_unique');
        DB::statement('ALTER TABLE configuraciones ADD CONSTRAINT configuraciones_clave_unique UNIQUE (clave)');
        DB::statement('ALTER TABLE caja_aperturas DROP CONSTRAINT IF EXISTS caja_aperturas_tenant_fecha_unique');
        DB::statement('ALTER TABLE caja_aperturas ADD CONSTRAINT caja_aperturas_fecha_unique UNIQUE (fecha)');
    }
};
