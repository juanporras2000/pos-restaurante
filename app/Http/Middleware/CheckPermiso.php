<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Perfil;
use Illuminate\Support\Facades\Session;

class CheckPermiso
{
   public function handle(Request $request, Closure $next, int $permisoId)
    {
        $idPerfil = Session::get('id_perfil');

        if (!$idPerfil) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Sesión de perfil expirada.'], 401);
            }
            return redirect('/perfiles')->with('error', 'Sesión de perfil expirada.');
        }

        $tienePermiso = Perfil::where('id_perfil', $idPerfil)
            ->whereHas('permisos', function ($query) use ($permisoId) {
                $query->where('perfil_permiso.id_permiso', $permisoId);
            })->exists();

        if (!$tienePermiso) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'No tienes permiso para acceder a este módulo.'], 403);
            }
            return redirect('/pedidos')->with('error', 'No tienes permiso para acceder a este módulo.');
        }

        return $next($request);
    }
}
