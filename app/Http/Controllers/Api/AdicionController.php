<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Adicion;
use Illuminate\Http\Request;

class AdicionController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->boolean('todas')
            ? Adicion::orderBy('activo', 'desc')->orderBy('nombre')
            : Adicion::where('activo', true)->orderBy('nombre');

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:100',
            'precio' => 'required|numeric|min:0',
        ]);

        return response()->json(Adicion::create($data), 201);
    }

    public function update(Request $request, Adicion $adicion)
    {
        $data = $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'precio' => 'sometimes|numeric|min:0',
            'activo' => 'sometimes|boolean',
        ]);

        $adicion->update($data);

        return response()->json($adicion);
    }

    public function destroy(Adicion $adicion)
    {
        $adicion->delete();

        return response()->json(['mensaje' => 'Adición eliminada']);
    }
}
