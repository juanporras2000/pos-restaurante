<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
        public function up()
    {
        Schema::create('inventarios', function (Blueprint $table) {
            $table->id();

            $table->string('nombre'); // papa, carne, etc
            $table->decimal('stock', 10, 2);

            $table->timestamps();
        });
    }
};
