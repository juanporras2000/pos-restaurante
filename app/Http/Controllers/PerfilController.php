<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Perfil;
use App\Services\PerfilService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PerfilController extends Controller
{
    public function __construct(private readonly PerfilService $perfilService) {}

    public function verificarPin(Request $request)
    {
        $request->validate([
            'id_perfil' => 'required|exists:perfil,id_perfil',
            'pin'       => 'required|integer',
        ]);

        try {
            $perfil = $this->perfilService->verificarPin(
                Auth::id(),
                $request->id_perfil,
                $request->pin,
                $request->ip()
            );

            return response()->json([
                'success' => true,
                'perfil'  => [
                    'id_perfil'     => $perfil->id_perfil,
                    'nombre'        => $perfil->nombre,
                    'id_rol'        => $perfil->id_rol,
                    'imagen_perfil' => $perfil->imagen_perfil,
                    'permisos'      => $perfil->permisos
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            $errors = $e->errors();
            if (isset($errors['throttle'])) {
                return response()->json(['error' => $errors['throttle'][0], 'retry_after' => $errors['retry_after'][0] ?? 60], 429);
            }
            return response()->json(['error' => $e->getMessage(), 'intentos_restantes' => $errors['intentos_restantes'][0] ?? 0], 401);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    public function index()
    {
        $perfiles = Perfil::with(['rol', 'imagen'])
            ->where('id_user', Auth::id())
            ->get();

        return response()->json($perfiles);
    }

    public function dataInicialAdmin()
    {
        return response()->json([
            'roles'   => DB::table('rol')->get(['id_rol', 'nombre']),
            'galeria' => DB::table('imagenes_perfil')->get(['id_imagen', 'path'])
        ]);
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'nombre'    => 'required|string|max:255',
            'pin'       => 'nullable|numeric|digits:4',
            'permisos'  => 'array',
            'id_rol'    => 'required|integer',
            'id_imagen' => 'required|integer',
        ]);

        $perfil = Perfil::where('id_perfil', $id)->where('id_user', Auth::id())->firstOrFail();

        $perfilActualizado = $this->perfilService->actualizarPerfil($perfil, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Perfil y permisos actualizados correctamente',
            'perfil'  => $perfilActualizado
        ]);
    }

    public function indexAdmin()
    {
        return Perfil::where('id_user', Auth::id())
            ->with('rol', 'imagen', 'permisos:id_permiso')
            ->get()
            ->map(function ($perfil) {
                return [
                    'id_perfil'  => $perfil->id_perfil,
                    'nombre'     => $perfil->nombre,
                    'id_rol'     => $perfil->id_rol,
                    'nombre_rol' => $perfil->rol->nombre ?? 'Sin Rol',
                    'imagen'     => $perfil->imagen->path,
                    'id_imagen'  => $perfil->imagen->id_imagen,
                    'permisos'   => $perfil->permisos->pluck('id_permiso')
                ];
            });
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre'    => 'required|string|max:255',
            'pin'       => 'required|numeric|digits:4',
            'id_rol'    => 'required|integer',
            'id_imagen' => 'required|integer',
        ]);

        $perfil = $this->perfilService->crearPerfil(Auth::id(), $request->all());

        return response()->json([
            'success' => true,
            'perfil'  => $perfil
        ], 201);
    }

    public function storePrimerPerfil(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'pin'    => 'required|numeric|digits:4',
        ]);

        try {
            $perfil = $this->perfilService->crearPrimerPerfil(Auth::id(), $request->all());

            return response()->json([
                'success' => true,
                'perfil'  => $perfil,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function destroy(int $id)
    {
        $perfil = Perfil::where('id_perfil', $id)->where('id_user', Auth::id())->firstOrFail();
        $perfil->delete();

        return response()->json(['success' => true]);
    }
}
