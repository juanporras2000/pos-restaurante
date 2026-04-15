<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>POS</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gray-100">

<div x-data="{ open: true }" class="flex h-screen">

    <!-- SIDEBAR -->
    <aside class="w-64 bg-gray-900 text-white flex flex-col">

        <div class="p-4 text-xl font-bold border-b border-gray-700">
            POS
        </div>

        <nav class="mt-4 space-y-2 flex-1">

            <a href="/pedidos" class="block px-4 py-3 hover:bg-gray-800">
                🧾 Pedidos
            </a>

            <a href="/productos" class="block px-4 py-3 hover:bg-gray-800">
                🍔 Productos
            </a>

            <a href="/reporte" class="block px-4 py-3 hover:bg-gray-800">
                📊 Reportes
            </a>

        </nav>

        <div class="p-4 border-t border-gray-700">
            <form method="POST" action="/logout">
                @csrf
                <button class="w-full text-left">
                    🚪 Salir
                </button>
            </form>
        </div>

    </aside>

    <!-- MAIN -->
    <div class="flex-1 flex flex-col">

        <!-- TOPBAR -->
        <header class="bg-white shadow p-4 flex justify-between items-center">
            <div>
                👤 {{ auth()->user()->name ?? 'Usuario' }}
            </div>
        </header>

        <!-- CONTENT (CLAVE) -->
        <main class="flex-1 p-6 overflow-auto">
            @yield('content')
        </main>

    </div>

</div>

</body>
</html>