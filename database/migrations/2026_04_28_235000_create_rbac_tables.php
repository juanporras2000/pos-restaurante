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

        Schema::create('rol', function (Blueprint $table) {
            $table->id('id_rol');
            $table->string('nombre');
            $table->timestamps();
        });

        Schema::create('permiso', function (Blueprint $table) {
            $table->id('id_permiso');
            $table->string('descripcion');
            $table->timestamps();
        });

        Schema::create('perfil', function (Blueprint $table) {
            $table->id('id_perfil');
            $table->string('nombre');
            $table->integer('pin');
            $table->string('imagen_perfil');
            $table->foreignId('id_user')->constrained('users')
                ->onDelete('cascade');
            $table->foreignId('id_rol')
                ->unique()
                ->constrained('rol', 'id_rol')
                ->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('perfil_permiso', function (Blueprint $table) {
            $table->foreignId('id_perfil')
                ->constrained('perfil', 'id_perfil')
                ->onDelete('cascade');
            $table->foreignId('id_permiso')
                ->constrained('permiso', 'id_permiso')
                ->onDelete('cascade');
            $table->primary(['id_perfil', 'id_permiso']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rbac_tables');
    }
};
