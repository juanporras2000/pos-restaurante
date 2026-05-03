<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('producto_domicilio_insumos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->foreignId('insumo_id')->constrained('insumos')->cascadeOnDelete();
            $table->decimal('cantidad', 12, 4)->default(0);
            $table->timestamps();

            $table->unique(['producto_id', 'insumo_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('producto_domicilio_insumos');
    }
};
