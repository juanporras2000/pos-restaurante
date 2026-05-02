<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            // Costo persistido (cache). Se actualiza via InsumoObserver cuando cambia
            // costo_unitario de algún insumo de la receta.
            // NULL = no calculado todavía. 0 = calculado pero sin receta o insumos sin costo.
            $table->decimal('costo_calculado', 12, 4)->nullable()->after('precio');
        });
    }

    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn('costo_calculado');
        });
    }
};
