<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Laravel') }}</title>
    <link rel="icon" type="image/webp" href="{{ asset('logo-postaurante-favicon.webp') }}?v={{ time() }}">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    @livewireStyles
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen font-sans">

    <div x-data="{ open: false }" class="flex h-screen overflow-hidden">

        <div x-show="open" x-transition:enter="transition-opacity ease-linear duration-300"
            x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100"
            x-transition:leave="transition-opacity ease-linear duration-300" x-transition:leave-start="opacity-100"
            x-transition:leave-end="opacity-0" @click="open = false"
            class="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" aria-hidden="true" style="display:none"></div>

        <aside :class="open ? 'translate-x-0' : '-translate-x-full'"
            class="fixed inset-y-0 left-0 lg:static lg:inset-auto lg:translate-x-0 z-30 w-64 h-full overflow-y-auto bg-white shadow-lg flex flex-col transition-transform duration-300 ease-in-out">

            <div class="border-b py-3 border-gray-200 flex items-center justify-center gap-1">
                <img src="/assets/logo-postaurante.webp" alt="Logo Postaurante" class="w-10 h-10">
                <p class="font-bold text-lg text-gray-700">POSTAURANTE</p>
                <!-- Botón cerrar (solo móvil) -->
                <button @click="open = false"
                    class="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    aria-label="Cerrar menú">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            @php
                $permisosIds = session('permisos_ids', []);
            @endphp



            <nav class="mt-6 space-y-1 flex-1 px-4">

                {{-- ID 1: Pedidos --}}
                @if (in_array(1, $permisosIds))
                    <a href="/pedidos"
                        class="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group {{ request()->is('pedidos') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700' }}">
                        <svg class="mr-3 h-5 w-5 transition-colors duration-200 {{ request()->is('pedidos') ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600' }}"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                            aria-hidden="true">
                            <rect x="6" y="4" width="12" height="16" rx="2"></rect>
                            <path d="M9 8h6"></path>
                            <path d="M9 12h6"></path>
                            <path d="M9 16h4"></path>
                        </svg>
                        Pedidos
                    </a>
                @endif

                {{-- ID 2: Productos --}}
                @if (in_array(2, $permisosIds))
                    <a href="/productos"
                        class="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group {{ request()->is('productos') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700' }}">
                        <svg class="mr-3 h-5 w-5 transition-colors duration-200 {{ request()->is('productos') ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600' }}"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                            aria-hidden="true">
                            <path d="M4 3v7a2 2 0 0 0 2 2h1v8"></path>
                            <path d="M8 3v7"></path>
                            <path d="M12 3v7"></path>
                            <path d="M18 3v17"></path>
                            <path d="M18 3c2 2 2 6 0 8"></path>
                        </svg>
                        Productos
                    </a>
                @endif

                {{-- ID 3: Reportes --}}
                @if (in_array(3, $permisosIds))
                    <a href="/reportes"
                        class="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group {{ request()->is('reportes') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700' }}">
                        <svg class="mr-3 h-5 w-5 transition-colors duration-200 {{ request()->is('reportes') ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600' }}"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                            aria-hidden="true">
                            <path d="M5 19V9"></path>
                            <path d="M12 19V5"></path>
                            <path d="M19 19v-7"></path>
                            <path d="M4 19h16"></path>
                        </svg>
                        Reportes
                    </a>
                @endif

                {{-- ID 4: Gastos y apertura de caja --}}
                @if (in_array(4, $permisosIds))
                    <a href="/gastos"
                        class="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group {{ request()->is('gastos') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700' }}">
                        <svg class="mr-3 h-5 w-5 transition-colors duration-200 {{ request()->is('gastos') ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600' }}"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                            aria-hidden="true">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
                        </svg>
                        Gastos y apertura de caja
                    </a>
                @endif

                {{-- ID 5: Insumos --}}
                @if (in_array(5, $permisosIds))
                    <a href="/insumos"
                        class="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group {{ request()->is('insumos') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700' }}">
                        <svg class="mr-3 h-5 w-5 transition-colors duration-200 {{ request()->is('insumos') ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600' }}"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                            aria-hidden="true">
                            <path d="M4 3v7a2 2 0 0 0 2 2h1v8"></path>
                            <path d="M8 3v7"></path>
                            <path d="M12 3v7"></path>
                            <path d="M18 3v17"></path>
                            <path d="M18 3c2 2 2 6 0 8"></path>
                        </svg>
                        Insumos
                    </a>
                @endif

                {{-- ID 6: Configuración --}}
                @if (in_array(6, $permisosIds))
                    <a href="/configuraciones"
                        class="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group {{ request()->is('configuraciones') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700' }}">
                        <svg class="mr-3 h-5 w-5 transition-colors duration-200 {{ request()->is('configuraciones') ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600' }}"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                            aria-hidden="true">
                            <path
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                            </path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Configuración
                    </a>
                @endif

                {{-- ID 8: Nómina --}}
                @if (in_array(8, $permisosIds))
                    <a href="/nomina"
                        class="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group {{ request()->is('nomina') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700' }}">
                        <svg class="mr-3 h-5 w-5 transition-colors duration-200 {{ request()->is('nomina') ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600' }}"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                            aria-hidden="true">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"></path>
                        </svg>
                        Nómina
                    </a>
                @endif

            </nav>

            {{-- Alertas de stock bajo --}}
            @if (in_array(5, $permisosIds))
                <div id="stock-alertas" class="mx-3 mb-3 hidden">
                    <a href="/insumos"
                        class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 hover:bg-red-100 transition-colors">
                        <svg class="h-4 w-4 text-red-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <path
                                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z">
                            </path>
                        </svg>
                        <span id="stock-alertas-texto">Stock bajo</span>
                    </a>
                </div>
            @endif

            <div class="p-4 border-t border-gray-200">
                @if (session()->has('id_perfil'))
                    <form id="form-logout-perfil" method="POST" action="/logout-perfil">
                        @csrf
                        <button type="button" onclick="cerrarPerfilFronend()"
                            class="w-full flex items-center px-2 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200 group">
                            <svg class="mr-3 h-5 w-5 text-gray-500 transition-colors duration-200 group-hover:text-orange-600"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                aria-hidden="true">
                                <path d="M16 17l5-5-5-5"></path>
                                <path d="M21 12H9"></path>
                                <rect x="3" y="4" width="6" height="16" rx="1"></rect>
                            </svg>
                            Cerrar perfil
                        </button>
                    </form>
                @endif

                <form method="POST" action="/logout">
                    @csrf
                    <button
                        class="w-full flex items-center px-2 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200 group">
                        <svg class="mr-3 h-5 w-5 text-gray-500 transition-colors duration-200 group-hover:text-red-600"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                            aria-hidden="true">
                            <path d="M10 17l5-5-5-5"></path>
                            <path d="M15 12H3"></path>
                            <path d="M20 4v16"></path>
                        </svg>
                        Cerrar cuenta
                    </button>
                </form>
            </div>

        </aside>

        <!-- MAIN -->
        <div class="flex-1 flex flex-col">

            <!-- TOPBAR -->
            <header class="bg-white shadow-sm px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                <!-- Botón hamburguesa (solo móvil) -->
                <button @click="open = true"
                    class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
                    aria-label="Abrir menú">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        aria-hidden="true">
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <svg class="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.8" aria-hidden="true">
                            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
                            <path d="M5 20a7 7 0 0 1 14 0"></path>
                        </svg>
                    </div>
                    <div class="min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">{{ auth()->user()->name ?? 'Usuario' }}
                        </p>
                        <p class="text-xs text-gray-500">Bienvenido al sistema</p>
                    </div>
                </div>
                <div class="text-sm text-gray-500 shrink-0 hidden sm:block">
                    {{ now()->format('d/m/Y H:i') }}
                </div>
            </header>

            <!-- CONTENT -->
            <main class="flex-1 p-6 overflow-auto bg-gray-50">
                @yield('content')
            </main>

        </div>

    </div>

    @livewireScripts
    @stack('scripts')

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            (function() {
                // Función centralizada para actualizar el DOM con el array de alertas
                function actualizarInterfazAlertas(data) {
                    var caja = document.getElementById('stock-alertas');
                    var texto = document.getElementById('stock-alertas-texto');
                    if (!caja || !texto) return;

                    if (data && data.length > 0) {
                        texto.textContent = data.length === 1 ?
                            data[0].nombre + ': stock bajo' :
                            data.length + ' insumos con stock bajo';
                        caja.classList.remove('hidden');
                    } else {
                        caja.classList.add('hidden');
                    }
                }

                // 1. Carga inicial al refrescar o entrar por primera vez
                axios.get('/inventario/alertas')
                    .then(function(r) {
                        actualizarInterfazAlertas(r.data);
                    })
                    .catch(function() {});

                // 2. Conexión reactiva por WebSockets vía Laravel Echo
                if (window.Echo) {
                    // Escuchamos el canal público
                    let canal = window.Echo.channel('inventario-channel');

                    canal.listen('inventario.actualizado', function(e) {
                        if (e && e.alertas) actualizarInterfazAlertas(e.alertas);
                    });

                    // Opción B: Escucha con la convención de clases de Laravel (por si acaso)
                    canal.listen('.App\\Events\\InventarioActualizado', function(e) {
                        if (e && e.alertas) actualizarInterfazAlertas(e.alertas);
                    });

                    // Auditoría: Si entra en la pestaña Network, esto lo va a cazar sí o sí
                    canal.listenToAll(function(nombreEvento, datos) {
                        // Si los datos vienen envueltos directamente en el evento
                        if (datos && datos.alertas) {
                            actualizarInterfazAlertas(datos.alertas);
                        }
                    });
                }
            })();
        });

        function cerrarPerfilFronend() {
            localStorage.removeItem('perfil_activo');
            document.getElementById('form-logout-perfil').submit();
        }
    </script>

</body>

</html>
