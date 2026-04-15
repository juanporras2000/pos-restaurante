@extends('layouts.pos')

@section('content')

<div x-data="productosApp" class="p-6">

    <h1 class="text-2xl font-bold mb-4">Productos</h1>

    <!-- FORM -->
    <div class="bg-white p-4 rounded shadow mb-4">
        <input x-model="nombre" placeholder="Nombre" class="border p-2 mr-2">
        <input x-model="precio" placeholder="Precio" type="number" class="border p-2 mr-2">

        <button @click="crearProducto()" class="bg-green-500 text-white px-4 py-2 rounded">
            Guardar
        </button>
    </div>

    <!-- LISTA -->
    <div class="bg-white p-4 rounded shadow">
        <template x-for="p in productos" :key="p.id">
            <div class="flex justify-between border-b py-2">
                <span x-text="p.nombre"></span>
                <span>$ <span x-text="p.precio"></span></span>
            </div>
        </template>
    </div>

</div>

@endsection