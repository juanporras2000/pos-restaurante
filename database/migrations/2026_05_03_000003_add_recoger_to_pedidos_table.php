<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->string('nombre_cliente', 100)->nullable()->after('direccion');
        });

        // En PostgreSQL, alterar un CHECK constraint requiere hacerlo directamente con SQL
        DB::statement("ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_tipo_check");
        DB::statement("ALTER TABLE pedidos ADD CONSTRAINT pedidos_tipo_check CHECK (tipo IN ('mesa', 'domicilio', 'recoger'))");
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn('nombre_cliente');
        });

        DB::statement("ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_tipo_check");
        DB::statement("ALTER TABLE pedidos ADD CONSTRAINT pedidos_tipo_check CHECK (tipo IN ('mesa', 'domicilio'))");
    }
};
