<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>POS - Sistema de Punto de Venta</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen font-sans">

<div x-data="{ open: true }" class="flex h-screen">

    <!-- SIDEBAR -->
    <aside class="w-64 bg-white shadow-lg flex flex-col transition-all duration-300 ease-in-out">

        <div class="p-6 text-2xl font-bold text-gray-800 border-b border-gray-200">
            <span class="inline-flex items-center gap-2">
                <svg class="h-7 w-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                    <path d="M7 8h10"></path>
                    <path d="M7 12h3"></path>
                    <path d="M14 12h3"></path>
                    <path d="M7 16h3"></path>
                    <path d="M14 16h3"></path>
                </svg>
                <span>POS</span>
            </span>
        </div>

        <nav class="mt-6 space-y-1 flex-1 px-4">

            <a href="/pedidos" class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors duration-200 group">
                <svg class="mr-3 h-5 w-5 text-gray-500 transition-colors duration-200 group-hover:text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <rect x="6" y="4" width="12" height="16" rx="2"></rect>
                    <path d="M9 8h6"></path>
                    <path d="M9 12h6"></path>
                    <path d="M9 16h4"></path>
                </svg>
                Pedidos
            </a>

            <a href="/productos" class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors duration-200 group">
                <svg class="mr-3 h-5 w-5 text-gray-500 transition-colors duration-200 group-hover:text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <path d="M4 3v7a2 2 0 0 0 2 2h1v8"></path>
                    <path d="M8 3v7"></path>
                    <path d="M12 3v7"></path>
                    <path d="M18 3v17"></path>
                    <path d="M18 3c2 2 2 6 0 8"></path>
                </svg>
                Productos
            </a>

            <a href="/reporte" class="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors duration-200 group">
                <svg class="mr-3 h-5 w-5 text-gray-500 transition-colors duration-200 group-hover:text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <path d="M5 19V9"></path>
                    <path d="M12 19V5"></path>
                    <path d="M19 19v-7"></path>
                    <path d="M4 19h16"></path>
                </svg>
                Reportes
            </a>

        </nav>

        <div class="p-4 border-t border-gray-200">
            <form method="POST" action="/logout">
                @csrf
                <button class="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200 group">
                    <svg class="mr-3 h-5 w-5 text-gray-500 transition-colors duration-200 group-hover:text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        <path d="M10 17l5-5-5-5"></path>
                        <path d="M15 12H3"></path>
                        <path d="M20 4v16"></path>
                    </svg>
                    Salir
                </button>
            </form>
        </div>

    </aside>

    <!-- MAIN -->
    <div class="flex-1 flex flex-col">

        <!-- TOPBAR -->
        <header class="bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-200">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg class="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
                        <path d="M5 20a7 7 0 0 1 14 0"></path>
                    </svg>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-900">{{ auth()->user()->name ?? 'Usuario' }}</p>
                    <p class="text-xs text-gray-500">Bienvenido al sistema</p>
                </div>
            </div>
            <div class="text-sm text-gray-500">
                {{ now()->format('d/m/Y H:i') }}
            </div>
        </header>

        <!-- CONTENT -->
        <main class="flex-1 p-6 overflow-auto bg-gray-50">
            @yield('content')
        </main>

    </div>

</div>

</body>
</html>
