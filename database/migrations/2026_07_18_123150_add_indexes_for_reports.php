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
        // 1. Índices para la tabla Pedidos (Ventas, series temporales y distribución)
        Schema::table('pedidos', function (Blueprint $table) {
            // Optimiza rangos de fecha combinados con el cálculo del total facturado
            $table->index(['created_at', 'total'], 'pedidos_created_at_total_idx');
            // Optimiza la distribución por tipos de canales (mesa, domicilio)
            $table->index(['created_at', 'tipo'], 'pedidos_created_at_tipo_idx');
        });

        // 2. Índices para la tabla Pedido Detalles (Productos Top y Ganancias Estimadas)
        Schema::table('pedido_detalles', function (Blueprint $table) {
            // Crucial para acelerar los JOINs masivos filtrados por rangos de fecha del reporte
            $table->index(['created_at', 'pedido_id'], 'pedido_detalles_created_at_pedido_idx');
        });

        // 3. Índices para la tabla Pagos (Resumen de caja e ingresos netos)
        Schema::table('pagos', function (Blueprint $table) {
            // Optimiza la suma directa de columnas calculado en el arqueo de ingresos
            $table->index(['created_at', 'recibido', 'cambio'], 'pagos_reportes_ingresos_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropIndex('pedidos_created_at_total_idx');
            $table->dropIndex('pedidos_created_at_tipo_idx');
        });

        Schema::table('pedido_detalles', function (Blueprint $table) {
            $table->dropIndex('pedido_detalles_created_at_pedido_idx');
        });

        Schema::table('pagos', function (Blueprint $table) {
            $table->dropIndex('pagos_reportes_ingresos_idx');
        });
    }
};
