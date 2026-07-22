<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deudas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('trabajador_id')->constrained('trabajadores')->cascadeOnDelete();
            $table->enum('tipo', ['prestamo', 'compra', 'otro'])->default('otro');
            $table->string('concepto', 150);
            $table->unsignedBigInteger('monto_total'); // pesos colombianos
            $table->unsignedBigInteger('saldo'); // pendiente por descontar
            $table->date('fecha');
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'trabajador_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deudas');
    }
};
