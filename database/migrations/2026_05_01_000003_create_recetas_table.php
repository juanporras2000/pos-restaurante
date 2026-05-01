<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recetas', function (Blueprint $table) {
            $table->id();

            // Un producto tiene exactamente UNA receta activa
            $table->foreignId('producto_id')
                ->unique()
                ->constrained('productos')
                ->onDelete('cascade');

            // Prepared for multi-tenant isolation
            $table->unsignedBigInteger('tenant_id')->nullable()->index();

            $table->timestamps();

            // Índice compuesto para queries por tenant
            $table->index(['tenant_id', 'producto_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recetas');
    }
};
