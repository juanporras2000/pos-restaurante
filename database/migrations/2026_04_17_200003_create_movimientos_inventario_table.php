<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movimientos_inventario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('insumo_id')->constrained('insumos')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('pedido_id')->nullable()->constrained('pedidos')->nullOnDelete();
            $table->enum('tipo', ['entrada', 'salida', 'ajuste']);
            $table->decimal('cantidad', 10, 2);
            $table->decimal('stock_antes', 10, 2);
            $table->decimal('stock_despues', 10, 2);
            $table->string('motivo')->nullable(); // "venta pedido #5", "ajuste manual", etc.
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_inventario');
    }
};
