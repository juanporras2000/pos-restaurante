<?php

namespace App\Services;

use App\Models\Perfil;
use App\Models\Permiso;
use App\Models\Rol;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class PerfilService
{
    /**
     * Intenta verificar el PIN de un perfil aplicando Rate Limiting.
     */
    public function verificarPin(int $userId, int $perfilId, string $pin, string $ip): Perfil
    {
        $throttleKey = 'verify-pin:' . $userId . ':' . $ip;

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'throttle' => 'Demasiados intentos.',
                'retry_after' => $seconds
            ]);
        }

        $perfil = Perfil::where('id_perfil', $perfilId)
            ->where('id_user', $userId)
            ->with('permisos')
            ->first();

        if (!$perfil) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Perfil no encontrado o no autorizado');
        }

        if (Hash::check($pin, $perfil->pin)) {
            RateLimiter::clear($throttleKey);

            // Seteamos las variables de sesión del negocio
            session(['id_perfil' => $perfil->id_perfil]);
            session(['nombre_perfil' => $perfil->nombre]);

            return $perfil;
        }

        RateLimiter::hit($throttleKey, 60);
        $intentosRestantes = max(0, 5 - RateLimiter::attempts($throttleKey));

        throw ValidationException::withMessages([
            'pin' => 'El PIN es incorrecto.',
            'intentos_restantes' => $intentosRestantes
        ]);
    }

    /**
     * Crea un perfil regular y le asigna el primer permiso como fallback.
     */
    public function crearPerfil(int $userId, array $datos): Perfil
    {
        $perfil = new Perfil();
        $perfil->id_user   = $userId;
        $perfil->nombre    = $datos['nombre'];
        $perfil->pin       = Hash::make($datos['pin']);
        $perfil->id_rol   = $datos['id_rol'];
        $perfil->id_imagen = $datos['id_imagen'];
        $perfil->save();

        $primerPermisoId = Permiso::orderBy('id_permiso', 'asc')->value('id_permiso');
        $permisosAsignar = $primerPermisoId ? [$primerPermisoId] : [];
        $perfil->permisos()->sync($permisosAsignar);

        return $perfil;
    }

    /**
     * Inicializa el primer perfil de un usuario asignándole rol de Admin y todos los permisos del sistema.
     */
    public function crearPrimerPerfil(int $userId, array $datos): Perfil
    {
        if (Perfil::where('id_user', $userId)->exists()) {
            throw ValidationException::withMessages([
                'perfil' => 'El usuario ya tiene perfiles creados.'
            ]);
        }

        $rol = Rol::where('nombre', 'Administrador')->firstOrFail();

        $perfil = new Perfil();
        $perfil->id_user   = $userId;
        $perfil->nombre    = $datos['nombre'];
        $perfil->pin       = Hash::make($datos['pin']);
        $perfil->id_rol    = $rol->id_rol;
        $perfil->id_imagen = 1; // Primer avatar por defecto del SaaS
        $perfil->save();

        // Siembra de permisos total para el admin
        $perfil->permisos()->sync(Permiso::pluck('id_permiso'));

        session(['id_perfil'     => $perfil->id_perfil]);
        session(['nombre_perfil' => $perfil->nombre]);

        return $perfil->load(['rol', 'permisos']);
    }

    /**
     * Actualiza la información y sincroniza los permisos del perfil.
     */
    public function actualizarPerfil(Perfil $perfil, array $datos): Perfil
    {
        $perfil->nombre = $datos['nombre'];
        $perfil->id_rol = $datos['id_rol'];
        $perfil->id_imagen = $datos['id_imagen'];

        if (!empty($datos['pin'])) {
            $perfil->pin = Hash::make($datos['pin']);
        }
        $perfil->save();

        $perfil->permisos()->sync($datos['permisos'] ?? []);

        return $perfil->load('permisos');
    }
}
