<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
   ->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    apiPrefix: 'api/v1',
    channels: __DIR__.'/../routes/channels',
)
    ->withMiddleware(function (Middleware $middleware){
        $middleware->redirectUsersTo('/perfiles');

        $middleware->validateCsrfTokens(except: [
            'api/*',
            'api/v1/*',
        ]);
        $middleware->alias([
            'check.perfil' => \App\Http\Middleware\CheckPerfilActivo::class,
            'guest.perfil' => \App\Http\Middleware\RedirectIfPerfilActivo::class,
            'permiso'      => \App\Http\Middleware\CheckPermiso::class
        ]);
        $middleware->statefulApi();
        // Resuelve el tenant del usuario autenticado en cada request
        $middleware->appendToGroup('api', \App\Http\Middleware\SetTenantFromUser::class);
        $middleware->appendToGroup('web', \App\Http\Middleware\SetTenantFromUser::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Por favor, verifica bien los datos que estas ingresando.',
                    'errors'  => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lo sentimos pero este recurso no existe.',
                    'errors'  => null,
                ], 404);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autenticado.',
                    'errors'  => null,
                ], 401);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'No tienes permiso para esta acción.',
                    'errors'  => null,
                ], 403);
            }
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpExceptionInterface $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => config('app.debug') ? $e->getMessage() : 'No se encontró el recurso solicitado.',
                    'errors'  => null,
                ], $e->getStatusCode());
            }
        });

        $exceptions->render(function (\Throwable $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => config('app.debug') ? $e->getMessage() : 'No eres tu, somos nostros, estamos trabajando para solucionarlo.',
                    'errors'  => null,
                ], 500);
            }
        });
    })->create();
