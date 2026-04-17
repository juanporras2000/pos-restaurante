@extends('layouts.pos')

@section('content')

<div x-data="posManager" class="min-h-screen bg-gray-50 p-6">

    <!-- Header Section -->
    <div class="mb-8">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <svg class="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"></path>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
                    </svg>
                    Gestión de Pedidos
                </h1>
                <p class="text-gray-600 mt-1">Administra pedidos pendientes y crea nuevos</p>
            </div>
            <div class="flex items-center gap-4">
                <button @click="mostrarFormularioNuevo = true"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 4v16m8-8H4"></path>
                    </svg>
                    Nuevo Pedido
                </button>
            </div>
        </div>
    </div>

    <!-- Pending Orders Section -->
    <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
            Pedidos Pendientes
            <span class="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full" x-text="pedidosPendientes.length"></span>
        </h2>

        <!-- Empty State -->
        <div x-show="pedidosPendientes.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg class="h-16 w-16 text-gray-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No hay pedidos pendientes</h3>
            <p class="text-gray-500">Crea un nuevo pedido para comenzar</p>
        </div>

        <!-- Pending Orders Grid -->
        <div x-show="pedidosPendientes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <template x-for="pedido in pedidosPendientes" :key="pedido.id">
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <!-- Order Header -->
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="font-semibold text-gray-900">Pedido #<span x-text="pedido.id"></span></h3>
                            <p class="text-sm text-gray-500" x-text="formatDate(pedido.created_at)"></p>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                  :class="pedido.tipo === 'mesa' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                                <span x-text="pedido.tipo === 'mesa' ? 'Mesa ' + pedido.numero_mesa : 'Domicilio'"></span>
                            </span>
                        </div>
                    </div>

                    <!-- Order Items -->
                    <div class="space-y-2 mb-4 max-h-32 overflow-y-auto">
                        <template x-for="detalle in pedido.detalles" :key="detalle.id">
                            <div class="flex justify-between items-center text-sm">
                                <span class="text-gray-700" x-text="detalle.producto.nombre"></span>
                                <span class="text-gray-500">x<span x-text="detalle.cantidad"></span></span>
                                <span class="font-medium text-gray-900" x-text="'$' + parseFloat(detalle.subtotal).toFixed(2)"></span>
                            </div>
                        </template>
                    </div>

                    <!-- Order Total -->
                    <div class="border-t border-gray-200 pt-4 mb-4">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-gray-900">Total</span>
                            <span class="text-lg font-bold text-gray-900" x-text="'$' + parseFloat(pedido.total).toFixed(2)"></span>
                        </div>
                    </div>

                    <!-- Order Actions -->
                    <div class="flex gap-2">
                        <button @click="procesarPago(pedido)"
                                class="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                            Procesar Pago
                        </button>
                        <button @click="eliminarPedido(pedido.id)"
                                class="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm">
                            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </template>
        </div>
    </div>

    <!-- New Order Form Modal -->
    <div x-show="mostrarFormularioNuevo" x-transition class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <svg class="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 4v16m8-8H4"></path>
                        </svg>
                        Crear Nuevo Pedido
                    </h2>
                    <button @click="cerrarFormularioNuevo()" class="text-gray-400 hover:text-gray-600">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Order Type Selection -->
                    <div class="lg:col-span-1">
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h3 class="font-medium text-gray-900 mb-4">Tipo de Pedido</h3>

                            <div class="space-y-3">
                                <label class="flex items-center">
                                    <input type="radio" x-model="nuevoPedido.tipo" value="mesa" class="text-blue-600 focus:ring-blue-500">
                                    <span class="ml-2 text-sm font-medium text-gray-700">Para llevar a mesa</span>
                                </label>

                                <div x-show="nuevoPedido.tipo === 'mesa'" class="ml-6">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Número de mesa</label>
                                    <input type="number" x-model="nuevoPedido.numero_mesa" placeholder="Ej: 5" min="1"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                </div>

                                <label class="flex items-center">
                                    <input type="radio" x-model="nuevoPedido.tipo" value="domicilio" class="text-blue-600 focus:ring-blue-500">
                                    <span class="ml-2 text-sm font-medium text-gray-700">Para domicilio</span>
                                </label>

                                <div x-show="nuevoPedido.tipo === 'domicilio'" class="ml-6">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Dirección de entrega</label>
                                    <textarea x-model="nuevoPedido.direccion" @input="validarDireccion()" placeholder="Ej: calle 23 #11-21 apto 101"
                                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows="3"></textarea>
                                    <p x-show="direccionError" x-text="direccionError" class="mt-1 text-sm text-red-600"></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Products Selection -->
                    <div class="lg:col-span-2">
                        <div class="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 class="font-medium text-gray-900 mb-4">Seleccionar Productos</h3>

                            <!-- Products Grid -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 max-h-64 overflow-y-auto">
                                <template x-for="producto in productos" :key="producto.id">
                                    <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                                        <div class="flex-1">
                                            <h4 class="font-medium text-gray-900" x-text="producto.nombre"></h4>
                                            <p class="text-sm text-gray-500" x-text="'$' + producto.precio.toFixed(2)"></p>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <button @click="decrementarProductoNuevo(producto)"
                                                    class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-medium">
                                                -
                                            </button>
                                            <span class="w-8 text-center text-sm font-medium" x-text="getCantidadProductoNuevo(producto.id)">0</span>
                                            <button @click="incrementarProductoNuevo(producto)"
                                                    class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-medium">
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </template>
                            </div>

                            <!-- Order Summary -->
                            <div x-show="nuevoPedido.productos.length > 0" class="border-t border-gray-200 pt-4">
                                <h4 class="font-medium text-gray-900 mb-3">Resumen del Pedido</h4>
                                <div class="space-y-2 mb-4 max-h-32 overflow-y-auto">
                                    <template x-for="item in nuevoPedido.productos" :key="item.id">
                                        <div class="flex justify-between items-center text-sm">
                                            <span x-text="item.nombre"></span>
                                            <span>x<span x-text="item.cantidad"></span></span>
                                            <span class="font-medium" x-text="'$' + item.subtotal.toFixed(2)"></span>
                                            <button @click="eliminarProductoNuevo(item.id)"
                                                    class="ml-2 text-red-500 hover:text-red-700">
                                                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </template>
                                </div>
                                <div class="flex justify-between items-center text-lg font-semibold">
                                    <span>Total</span>
                                    <span x-text="'$' + calcularTotalNuevo().toFixed(2)"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Form Actions -->
                <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button @click="cerrarFormularioNuevo()"
                            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button @click="crearPedido()"
                            :disabled="!puedeCrearPedido()"
                            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors">
                        Crear Pedido
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Payment Modal -->
    <div x-show="mostrarPago" x-transition class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div class="p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <svg class="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm7-5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
                        </svg>
                        Procesar Pago - Pedido #<span x-text="pedidoPago?.id"></span>
                    </h2>
                    <button @click="cerrarPago()" class="text-gray-400 hover:text-gray-600">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium text-gray-700">Total a pagar</span>
                            <span class="text-lg font-semibold text-gray-900" x-text="'$' + (pedidoPago ? parseFloat(pedidoPago.total).toFixed(2) : '0.00')"></span>
                        </div>
                    </div>

                    <div>
                        <label for="metodo_pago" class="block text-sm font-medium text-gray-700 mb-2">Método de pago</label>
                        <select id="metodo_pago" x-model="metodo_pago" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="efectivo">💵 Efectivo</option>
                            <option value="nequi">📱 Nequi</option>
                            <option value="tarjeta">💳 Tarjeta de crédito/débito</option>
                        </select>
                    </div>

                    <div x-show="metodo_pago === 'efectivo'">
                        <label for="dinero_recibido" class="block text-sm font-medium text-gray-700 mb-2">Dinero recibido</label>
                        <input id="dinero_recibido" type="number" x-model="recibido" placeholder="0.00" step="0.01"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <div x-show="recibido > 0 && pedidoPago" class="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                            <div class="flex justify-between text-sm">
                                <span class="text-green-700">Cambio:</span>
                                <span class="font-medium text-green-700" x-text="'$' + (recibido - parseFloat(pedidoPago.total)).toFixed(2)"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 mt-6">
                    <button @click="cerrarPago()"
                            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button @click="confirmarPago()"
                            class="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Confirmar Pago
                    </button>
                </div>
            </div>
        </div>
    </div>

</div>

@endsection
