@extends('layouts.pos')

@section('content')

<div x-data="pos" class="grid grid-cols-3 gap-4 h-full">

    <!-- 🛒 PRODUCTOS -->
    <div class="col-span-2">
        <h2 class="text-2xl font-bold mb-4">Productos</h2>

        <div class="grid grid-cols-3 gap-4">
            <template x-for="producto in productos" :key="producto.id">
                <div @click="agregarProducto(producto)" class="bg-white p-4 rounded shadow cursor-pointer hover:bg-green-100">
                    <h3 class="font-bold" x-text="producto.nombre"></h3>
                    <p class="text-sm text-gray-500">$ <span x-text="producto.precio"></span></p>
                </div>
            </template>
        </div>
    </div>

    <!-- 🧾 CARRITO -->
    <div class="bg-white p-4 rounded shadow flex flex-col h-[80%]">
        <h2 class="text-xl font-bold mb-4">Pedido</h2>

        <template x-for="item in carrito" :key="item.id">
            <div class="flex justify-between mb-2">
                <div>
                    <p x-text="item.nombre"></p>
                    <small>x <span x-text="item.cantidad"></span></small>
                </div>
                <div class="flex items-center gap-2">
                    <span>$ <span x-text="item.subtotal"></span></span>
                    <button @click="eliminar(item)" class="text-red-500">✕</button>
                </div>
            </div>
        </template>

        <div class="mt-auto">
            <hr class="my-2">

            <p class="text-lg font-bold">
                Total: $ <span x-text="total"></span>
            </p>

            <button 
                @click="crearPedido()"
                class="bg-green-500 text-white w-full mt-4 py-2 rounded"
            >
                Crear Pedido
            </button>

            <button 
                @click="abrirPago()"
                class="bg-blue-500 text-white w-full mt-2 py-2 rounded"
            >
                Cobrar
            </button>
        </div>
    </div>



<!-- 💰 MODAL PAGO -->
<div x-show="mostrarPago" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded w-96">
        <h2 class="text-xl font-bold mb-4">Pago</h2>

        <p>Total: $ <span x-text="total"></span></p>

        <input 
            type="number" 
            x-model="recibido"
            placeholder="Dinero recibido"
            class="border w-full p-2 mt-2"
        >

        <select x-model="metodo_pago" class="border w-full p-2 mt-2">
            <option value="efectivo">Efectivo</option>
            <option value="nequi">Nequi</option>
            <option value="tarjeta">Tarjeta</option>
        </select>

        <button 
            @click="pagar()"
            class="bg-green-500 text-white w-full mt-4 py-2 rounded"
        >
            Confirmar Pago
        </button>

        <button 
            @click="mostrarPago=false"
            class="w-full mt-2 py-2"
        >
            Cancelar
        </button>
    </div>
</div>
</div>

@endsection