<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receta_detalles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('receta_id')
                ->constrained('recetas')
                ->onDelete('cascade'); // Si se borra la receta, se borran sus detalles

            $table->foreignId('insumo_id')
                ->constrained('insumos')
                ->onDelete('restrict'); // No permitir borrar insumos en uso (protección DB)

            // Cantidad expresada en la unidad de medida del insumo
            // Ej: 150 (gramos), 0.5 (litros)
            $table->decimal('cantidad', 12, 4);

            $table->timestamps();

            // Un insumo no puede aparecer dos veces en la misma receta
            $table->unique(['receta_id', 'insumo_id']);

            // Índice para lookups por insumo (útil en el Observer de costos)
            $table->index('insumo_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receta_detalles');
    }
};
