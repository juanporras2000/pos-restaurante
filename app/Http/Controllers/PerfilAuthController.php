<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Perfil;
use Illuminate\Support\Facades\Auth;

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
                        ->first();

        if (!$perfil) {
            return response()->json(['error' => 'Perfil no encontrado o no autorizado'], 404);
        }

        if ($perfil->pin === (int)$request->pin) {
            return response()->json([
                'success' => true,
                'perfil'  => [
                    'id_perfil'     => $perfil->id_perfil,
                    'nombre'        => $perfil->nombre,
                    'id_rol'        => $perfil->id_rol,
                    'imagen_perfil' => $perfil->imagen_perfil
                ]
            ], 200);
        }

        return response()->json(['error' => 'El PIN es incorrecto'], 401);
    }
}


