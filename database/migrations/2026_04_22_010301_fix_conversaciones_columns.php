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
            // Hacer mensaje nullable para el registro de estado
            $table->text('mensaje')->nullable()->change();
            
            // Asegurar que carrito existe (por si migrate:fresh lo omitió)
            if (!Schema::hasColumn('conversaciones', 'carrito')) {
                $table->json('carrito')->nullable()->after('estado');
            }
        });
    }

    public function down(): void
    {
        Schema::table('conversaciones', function (Blueprint $table) {
            $table->text('mensaje')->nullable(false)->change();
        });
    }
};
