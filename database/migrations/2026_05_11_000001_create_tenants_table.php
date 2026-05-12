<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('slug')->unique();             // identificador amigable (ej: "rancho-grill")
            $table->enum('plan', ['gratis', 'pro'])->default('gratis');
            $table->boolean('activo')->default(true);
            $table->json('configuracion')->nullable();    // reservado para configuraciones futuras
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
