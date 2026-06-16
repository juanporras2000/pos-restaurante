<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPerfilActivo
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->session()->has('id_perfil')) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Debes seleccionar un perfil primero.'
                ], 401);
            }

            return redirect('/perfiles')->with('error', 'Debes seleccionar un perfil primero.');
        }

        return $next($request);
    }
}
