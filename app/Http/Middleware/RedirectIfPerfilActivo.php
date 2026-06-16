<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfPerfilActivo
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->session()->has('id_perfil')) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Ya cuentas con un perfil activo.',
                    'perfil_activo' => true
                ], 200);
            }
            return redirect('/pedidos');
        }

        return $next($request);
    }
}
