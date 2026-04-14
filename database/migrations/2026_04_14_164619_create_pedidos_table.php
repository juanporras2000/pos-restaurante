<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();

            $table->enum('tipo', ['mesa', 'domicilio']);

            // Para mesa
            $table->integer('numero_mesa')->nullable();

            // Para domicilio
            $table->string('direccion')->nullable();

            $table->decimal('total', 10, 2)->default(0);

            $table->enum('estado', ['pendiente', 'pagado'])->default('pendiente');

            $table->timestamps();
        });
    }
};
