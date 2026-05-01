<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('insumos', function (Blueprint $table) {
            // Costo por unidad de medida (ej. costo por gramo, por ml, etc.)
            $table->decimal('costo_unitario', 12, 4)->default(0)->after('stock_minimo');
        });
    }

    public function down(): void
    {
        Schema::table('insumos', function (Blueprint $table) {
            $table->dropColumn('costo_unitario');
        });
    }
};
