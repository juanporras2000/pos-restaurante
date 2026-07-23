<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('deuda_abonos', function (Blueprint $table) {
            $table->enum('origen', ['manual', 'auto'])->default('manual')->after('fecha');
        });
    }

    public function down(): void
    {
        Schema::table('deuda_abonos', function (Blueprint $table) {
            $table->dropColumn('origen');
        });
    }
};
