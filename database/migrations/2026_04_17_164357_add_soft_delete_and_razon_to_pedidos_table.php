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
        Schema::table('pedidos', function (Blueprint $table) {
            $table->text('razon_eliminacion')->nullable()->after('estado');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn('razon_eliminacion');
            $table->dropSoftDeletes();
        });
    }
};
