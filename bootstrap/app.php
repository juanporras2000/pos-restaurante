<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
   ->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
)
    ->withMiddleware(function (Middleware $middleware){
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
        $middleware->statefulApi();
        // Resuelve el tenant del usuario autenticado en cada request
        $middleware->appendToGroup('api', \App\Http\Middleware\SetTenantFromUser::class);
        $middleware->appendToGroup('web', \App\Http\Middleware\SetTenantFromUser::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
