<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function index()
    {
        return response()->json(Producto::with('categoria')->get());
    }

    public function store(Request $request)
    {
        $producto = Producto::create($request->only('nombre', 'precio', 'categoria_id'));
        return response()->json($producto->load('categoria'));
    }

    public function update(Request $request, $id)
    {
        $producto = Producto::findOrFail($id);
        $producto->update($request->only('nombre', 'precio', 'categoria_id'));
        return response()->json($producto->load('categoria'));
    }

    public function destroy($id)
    {
        Producto::findOrFail($id)->delete();
        return response()->json(['message' => 'Producto eliminado']);
    }
}