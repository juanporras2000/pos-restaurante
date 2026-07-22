<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Perfil;

class CheckPerfilActivo
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Verificamos si existe el ID del perfil en la sesión
        if (!$request->session()->has('id_perfil')) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Debes seleccionar un perfil primero.'], 401);
            }
            return redirect('/perfiles')->with('error', 'Debes seleccionar un perfil primero.');
        }

        // 2. Si no se han cacheado los permisos, se consultan una única vez
        if (!$request->session()->has('permisos_ids')) {
            $idPerfil = $request->session()->get('id_perfil');
            $perfil = Perfil::with('permisos')->find($idPerfil);

            if ($perfil) {
                $permisosIds = $perfil->permisos->pluck('id_permiso')->toArray();
                $request->session()->put('permisos_ids', $permisosIds);
            } else {
                $request->session()->forget(['id_perfil', 'permisos_ids']);
                if ($request->expectsJson()) {
                    return response()->json(['error' => 'Perfil inválido.'], 401);
                }
                return redirect('/perfiles');
            }
        }

        // =========================================================================
        // REDIRECCIÓN INTERNA PARA PERFILES SIN PERMISOS
        // =========================================================================
        $permisos = $request->session()->get('permisos_ids', []);

        // Si el array de permisos está vacío y el usuario NO está intentando ver la pantalla de "sin-permisos"
        if (empty($permisos) && !$request->is('sin-permisos')) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Acceso denegado. Perfil sin permisos asignados.'], 403);
            }
            return redirect()->route('sin-permisos');
        }
        // =========================================================================

        return $next($request);
    }
}
