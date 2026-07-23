<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    @include('partials.theme-init')
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel')}}</title>
    <link rel="icon" type="image/webp" href="{{ asset('logo-postaurante-favicon.webp') }}?v={{ time() }}">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="font-sans text-gray-900 dark:text-gray-100 antialiased overflow-hidden">
    <div class="min-h-screen relative flex items-center justify-center bg-slate-50 dark:bg-gray-950 overflow-hidden">
        <!-- Capas de fondo decorativas -->
        <div class="absolute inset-0 z-0">
            <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50">
            </div>
            <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-slate-100 dark:bg-gray-800 rounded-full blur-3xl opacity-50">
            </div>
        </div>

        <button type="button" onclick="window.toggleTheme()" aria-label="Cambiar tema"
            class="absolute top-4 right-4 z-20 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800 transition-colors">
            <svg class="h-5 w-5 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
            </svg>
            <svg class="h-5 w-5 hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
            </svg>
        </button>

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
                    class="w-full bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 px-8 py-10 transition-all duration-300">
                    {{ $slot }}
                </div>

                <!-- Footer simple -->
                <p class="mt-8 text-xs text-center text-gray-400 dark:text-gray-500 font-medium">
                    &copy; {{ date('Y') }} {{ config('app.name') }}. Todos los derechos reservados.
                </p>
            </div>
        </div>
    </div>
</body>

</html>
