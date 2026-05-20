<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="font-sans text-gray-900 antialiased overflow-hidden">
    <div class="min-h-screen relative flex items-center justify-center bg-slate-50 overflow-hidden">
        <!-- Capas de fondo decorativas -->
        <div class="absolute inset-0 z-0">
            <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50">
            </div>
            <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-50">
            </div>
        </div>

        <div class="relative z-10 w-full max-w-sm px-4">
            <div class="flex flex-col items-center">
                <!-- Logo con contenedor -->
                <div class="mb-4 transform transition-transform hover:scale-110 duration-500">
                    <a href="/">
                        <img src="/assets/logo-postaurante.webp" alt="Logo Postaurante" class="w-20 h-20 fill-current">
                    </a>
                </div>

                <!-- Card principal -->
                <div
                    class="w-full bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100 px-8 py-10 transition-all duration-300">
                    {{ $slot }}
                </div>

                <!-- Footer simple -->
                <p class="mt-8 text-xs text-center text-gray-400 font-medium">
                    &copy; {{ date('Y') }} {{ config('app.name') }}. Todos los derechos reservados.
                </p>
            </div>
        </div>
    </div>
</body>

</html>
