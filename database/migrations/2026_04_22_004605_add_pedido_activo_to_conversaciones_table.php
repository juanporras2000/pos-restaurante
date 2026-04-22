<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('conversaciones', function (Blueprint $table) {
            // ID del pedido activo actual para este número de teléfono
            $table->unsignedBigInteger('pedido_activo_id')->nullable()->after('carrito');
        });
    }

    public function down(): void
    {
        Schema::table('conversaciones', function (Blueprint $table) {
            $table->dropColumn('pedido_activo_id');
        });
    }
};
