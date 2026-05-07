<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index()
    {
        return response()->json(
            Categoria::withCount('productos')->orderBy('nombre')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:100|unique:categorias,nombre',
        ]);

        return response()->json(Categoria::create($data), 201);
    }

    public function update(Request $request, Categoria $categoria)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:100|unique:categorias,nombre,' . $categoria->id,
        ]);

        $categoria->update($data);

        return response()->json($categoria);
    }

    public function destroy(Categoria $categoria)
    {
        if ($categoria->productos()->exists()) {
            return response()->json(
                ['error' => 'No se puede eliminar: tiene productos asignados.'],
                409
            );
        }

        $categoria->delete();

        return response()->json(['message' => 'Categoría eliminada']);
    }
}
