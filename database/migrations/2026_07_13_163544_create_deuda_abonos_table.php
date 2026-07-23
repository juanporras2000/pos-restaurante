<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deuda_abonos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->foreignId('deuda_id')->constrained('deudas')->cascadeOnDelete();
            $table->unsignedBigInteger('monto');
            $table->date('fecha'); // semana de nómina en la que se descuenta
            $table->timestamps();

            $table->index(['tenant_id', 'fecha']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deuda_abonos');
    }
};
