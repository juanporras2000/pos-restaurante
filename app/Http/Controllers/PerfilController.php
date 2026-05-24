<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Perfil;
use App\Models\Permiso;
use App\Models\Rol;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PerfilController extends Controller
{
    public function verificarPin(Request $request)
    {
        $request->validate([
            'id_perfil' => 'required|exists:perfil,id_perfil',
            'pin'       => 'required|integer',
        ]);


        $perfil = Perfil::where('id_perfil', $request->id_perfil)
            ->where('id_user', Auth::id())
            ->with('permisos')
            ->first();

        if (!$perfil) {
            return response()->json(['error' => 'Perfil no encontrado o no autorizado'], 404);
        }

        if (Hash::check($request->pin, $perfil->pin)) {

            session(['id_perfil' => $perfil->id_perfil]);
            session(['nombre_perfil' => $perfil->nombre]);

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
        }

        return response()->json(['error' => 'El PIN es incorrecto'], 401);
    }

    public function index()
    {
        $userId = Auth::id();

        $perfiles = Perfil::with(['rol', 'imagen'])
            ->where('id_user', $userId)
            ->get();

        return response()->json($perfiles);
    }

    public function dataInicialAdmin()
    {
        $roles = DB::table('rol')->get(['id_rol', 'nombre']);

        // Traemos las imágenes de la tabla 'imagenes_perfil' (id_imagen_perfil, url)
        $avatarGaleria = DB::table('imagenes_perfil')->get(['id_imagen', 'path']);

        return response()->json([
            'roles' => $roles,
            'galeria' => $avatarGaleria
        ]);
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'nombre'   => 'required|string|max:255',
            'pin'      => 'nullable|numeric|digits:4',
            'permisos' => 'array',
            'id_rol'   => 'required|integer',
            'id_imagen' => 'nullable|integer',
        ]);

        $perfil = Perfil::findOrFail($id);

        $perfil->nombre = $request->nombre;
        $perfil->id_rol = $request->id_rol;

        if ($request->filled('id_imagen_perfil')) {
            $perfil->id_imagen_perfil = $request->id_imagen_perfil;
        }

        if ($request->filled('pin')) {
            $perfil->pin = Hash::make($request->pin);
        }
        $perfil->save();

        // 2. Sincronizar permisos en la tabla pivote
        // Esto actualizará 'perfil_permiso' automáticamente
        $perfil->permisos()->sync($request->permisos);

        return response()->json([
            'success' => true,
            'message' => 'Perfil y permisos actualizados correctamente',
            'perfil'  => $perfil->load('permisos')
        ]);
    }

    public function indexAdmin()
    {
        $userId = Auth::id();

        // Traemos los perfiles con la relación de permisos, pero solo el ID para el checklist
        return Perfil::where('id_user', $userId)
            ->with('rol', 'imagen', 'permisos:id_permiso')
            ->get()
            ->map(function ($perfil) {
                return [
                    'id_perfil' => $perfil->id_perfil,
                    'nombre'    => $perfil->nombre,
                    'id_rol'    => $perfil->id_rol,
                    'nombre_rol'    => $perfil->rol->nombre ?? 'Sin Rol', // Nombre del rol para el UI
                    'imagen' => $perfil->imagen->path,
                    'permisos'  => $perfil->permisos->pluck('id_permiso')
                ];
            });
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'pin'    => 'required|numeric|digits:4',
            'id_rol' => 'required|integer',
            'id_imagen' => 'required|integer',
        ]);

        $perfil = new Perfil();
        $perfil->id_user   = Auth::id();
        $perfil->nombre  = $request->nombre;
        $perfil->pin     = Hash::make($request->pin);
        $perfil->id_rol  = $request->id_rol;
        $perfil->id_imagen = $request->id_imagen;
        $perfil->save();

        $primerPermisoId = \App\Models\Permiso::orderBy('id_permiso', 'asc')->value('id_permiso');
        $permisosAsignar = $primerPermisoId ? [$primerPermisoId] : [];
        $perfil->permisos()->sync($permisosAsignar);

        return response()->json([
            'success' => true,
            'perfil'  => $perfil
        ], 201);
    }

    public function storePrimerPerfil(Request $request)
    {
        if (Perfil::where('id_user', Auth::id())->exists()) {
            return response()->json(['error' => 'El usuario ya tiene perfiles creados.'], 422);
        }

        $request->validate([
            'nombre' => 'required|string|max:255',
            'pin'    => 'required|numeric|digits:4',
        ]);

        $rol = Rol::where('nombre', 'Administrador')->firstOrFail();

        $perfil = new Perfil();
        $perfil->id_user   = Auth::id();
        $perfil->nombre    = $request->nombre;
        $perfil->pin       = Hash::make($request->pin);
        $perfil->id_rol    = $rol->id_rol;
        $perfil->id_imagen = 1;
        $perfil->save();

        $perfil->permisos()->sync(Permiso::pluck('id_permiso'));

        session(['id_perfil'     => $perfil->id_perfil]);
        session(['nombre_perfil' => $perfil->nombre]);

        return response()->json([
            'success' => true,
            'perfil'  => $perfil->load(['rol', 'permisos']),
        ], 201);
    }

    public function destroy(int $id)
    {
        $perfil = Perfil::where('id_perfil', $id)
            ->where('id_user', Auth::id())
            ->firstOrFail();

        $perfil->delete();

        return response()->json(['success' => true]);
    }
}
