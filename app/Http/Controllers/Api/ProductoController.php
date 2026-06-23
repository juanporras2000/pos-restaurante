<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Http\Requests\ProductoRequest;
use App\Services\ProductoService;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function __construct(private readonly ProductoService $productoService) {}

    public function index(Request $request)
    {
        if ($request->boolean('todos')) {
            return response()->json(
                Producto::with('categoria', 'insumos')
                    ->when($request->filled('buscar'), fn($q) => $q->where('nombre', 'like', '%' . $request->buscar . '%'))
                    ->get()
            );
        }

        $query = Producto::with('categoria', 'insumos', 'receta.detalles.insumo', 'insumosDomicilio');

        if ($request->filled('buscar')) {
            $query->where('nombre', 'like', '%' . $request->buscar . '%');
        }

        if ($request->filled('categoria_id')) {
            $query->where('categoria_id', $request->categoria_id);
        }

        return response()->json($query->paginate(8));
    }

    public function show($id)
    {
        $producto = Producto::with('categoria', 'insumos', 'receta.detalles.insumo', 'insumosDomicilio')
            ->findOrFail($id);

        return response()->json($producto);
    }

    public function store(ProductoRequest $request)
    {
        $producto = $this->productoService->crearProducto(
            $request->except(['imagen_producto', 'receta', 'insumos', 'receta_domicilio']),
            $request->file('imagen_producto'),
            $this->parseInsumos($request),
            $this->parseInsumosDomicilio($request)
        );

        return response()->json(
            $producto->load('categoria', 'insumos', 'receta.detalles.insumo', 'insumosDomicilio'),
            201
        );
    }

    public function update(ProductoRequest $request, $id)
    {
        $producto = Producto::findOrFail($id);

        $productoActualizado = $this->productoService->actualizarProducto(
            $producto,
            $request->except(['imagen_producto', 'receta', 'insumos', 'receta_domicilio']),
            $request->file('imagen_producto'),
            $this->parseInsumos($request),
            $this->parseInsumosDomicilio($request)
        );

        return response()->json(
            $productoActualizado->load('categoria', 'insumos', 'receta.detalles.insumo', 'insumosDomicilio')
        );
    }

    public function destroy($id)
    {
        $producto = Producto::findOrFail($id);
        $this->productoService->eliminarProducto($producto);

        return response()->json(['message' => 'Producto eliminado']);
    }

    // Métodos auxiliares de parsing del Request (Se mantienen privados aquí porque interpretan la estructura HTTP entrante)
    private function parseInsumos(Request $request): ?array
    {
        $raw = $request->input('receta') ?? $request->input('insumos');
        if (is_null($raw)) return null;
        if (is_string($raw)) return json_decode($raw, true) ?? [];
        return $raw;
    }

    private function parseInsumosDomicilio(Request $request): ?array
    {
        $raw = $request->input('receta_domicilio');
        if (is_null($raw)) return null;
        if (is_string($raw)) return json_decode($raw, true) ?? [];
        return $raw;
    }
}
