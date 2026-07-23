<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    @include('partials.theme-init')
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name', 'Laravel')}}</title>
    <link rel="icon" type="image/webp" href="{{ asset('logo-postaurante-favicon.webp') }}?v={{ time() }}">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/perfiles.jsx'])
</head>
<body>
    <div id="perfiles-app"></div>
</body>
</html>
