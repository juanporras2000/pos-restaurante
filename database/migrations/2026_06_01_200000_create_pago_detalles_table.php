<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pago_detalles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pago_id')->constrained('pagos')->cascadeOnDelete();
            $table->string('metodo_pago');
            $table->decimal('monto', 10, 2);
            $table->decimal('recibido', 10, 2)->default(0);
            $table->decimal('cambio', 10, 2)->default(0);
            $table->unsignedBigInteger('tenant_id');
            $table->timestamps();

            $table->index(['pago_id', 'tenant_id']);
        });

        // Migrar pagos existentes: cada pago previo se convierte en un detalle único
        DB::statement("
            INSERT INTO pago_detalles (pago_id, metodo_pago, monto, recibido, cambio, tenant_id, created_at, updated_at)
            SELECT id, metodo_pago, total, recibido, cambio, tenant_id, created_at, updated_at
            FROM pagos
            WHERE metodo_pago IS NOT NULL
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('pago_detalles');
    }
};