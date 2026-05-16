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
        // 1. Obtener el ID del perfil activo de la sesión
        $idPerfil = Session::get('id_perfil');

        if (!$idPerfil) {
            return redirect('/perfiles')->with('error', 'Sesión de perfil expirada.');
        }

        // 2. Buscar el perfil y verificar si tiene el permiso (ID) requerido
        $tienePermiso = Perfil::where('id_perfil', $idPerfil)
            ->whereHas('permisos', function ($query) use ($permisoId) {
                $query->where('perfil_permiso.id_permiso', $permisoId);
            })->exists();

        if (!$tienePermiso) {
            // Si no tiene permiso, lo mandamos a pedidos (o una página de error)
            return redirect('/pedidos')->with('error', 'No tienes permiso para acceder a este módulo.');
        }

        return $next($request);
    }
}
