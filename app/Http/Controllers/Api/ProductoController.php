<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Http\Requests\ProductoRequest;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    // Convierte el campo insumos a array tanto si viene como JSON string (FormData)
    // como si viene directamente como array (JSON body).
    private function parseInsumos(Request $request): ?array
    {
        $raw = $request->input('receta') ?? $request->input('insumos');
        if (is_null($raw)) return null;
        if (is_string($raw)) return json_decode($raw, true) ?? [];
        return $raw;
    }

    private function syncInsumos(Producto $producto, ?array $insumos): void
    {
        if (is_null($insumos)) return;

        $sync = [];
        foreach ($insumos as $item) {
            $sync[$item['insumo_id']] = ['cantidad' => $item['cantidad']];
        }
        $producto->insumos()->sync($sync);
    }

    public function index(Request $request)
    {
        $query = Producto::with('categoria', 'insumos');

        if ($request->filled('buscar')) {
            $query->where('nombre', 'like', '%' . $request->buscar . '%');
        }

        // Permite obtener todos los productos sin paginar (para el POS de pedidos)
        if ($request->boolean('todos')) {
            return response()->json($query->get());
        }

        return response()->json($query->paginate(5));
    }

    public function show($id)
    {
        $producto = Producto::with('categoria', 'insumos')->findOrFail($id);
        return response()->json($producto);
    }

    public function store(ProductoRequest $request)
    {
        $data = $request->except('imagen_producto');

        if ($request->hasFile('imagen_producto')) {
            $data['imagen_producto'] = $request->file('imagen_producto')->store('productos', 'public');
        }

        $producto = Producto::create($data);
        $this->syncInsumos($producto, $this->parseInsumos($request));

        return response()->json(
            $producto->load('categoria', 'insumos'),
            201);
    }

    public function update(ProductoRequest $request, $id)
    {
        $producto = Producto::findOrFail($id);

        $data = $request->except('imagen_producto');

        if ($request->hasFile('imagen_producto')) {
            $data['imagen_producto'] = $request->file('imagen_producto')->store('productos', 'public');
        }

        $producto->update($data);
        $this->syncInsumos($producto, $this->parseInsumos($request));

        return response()->json($producto->load('categoria', 'insumos'));
    }

    public function destroy($id)
    {
        $producto = Producto::findOrFail($id);

        if ($producto->imagen_producto) {
            Storage::disk('public')->delete($producto->imagen_producto);
        }

        $producto->delete(); // SoftDelete: setea deleted_at, no borra la fila
        return response()->json(['message' => 'Producto eliminado']);
    }
}
