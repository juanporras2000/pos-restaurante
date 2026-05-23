<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\Receta;
use App\Http\Requests\ProductoRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;


class ProductoController extends Controller
{
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

    /**
     * Sincroniza la receta del producto en ambas estructuras:
     *  1. producto_insumo  → backward-compat para el ModalProducto del frontend
     *  2. recetas / receta_detalles → fuente canónica para cálculo de costos
     *
     * Wrapped en transacción para garantizar consistencia.
     */
    private function syncInsumos(Producto $producto, ?array $insumos): void
    {
        if (is_null($insumos)) return;

        DB::transaction(function () use ($producto, $insumos) {
            // ── 1. Legacy pivot (ModalProducto lo lee para pre-cargar el formulario) ──
            $sync = [];
            foreach ($insumos as $item) {
                $sync[(int) $item['insumo_id']] = ['cantidad' => $item['cantidad']];
            }
            $producto->insumos()->sync($sync);

            // ── 2. Receta canónica
            $receta = Receta::firstOrCreate(
                ['producto_id' => $producto->id],
                ['tenant_id'   => $producto->tenant_id]
            );

            // Delete + re-insert es atómico dentro de la transacción
            $receta->detalles()->delete();

            foreach ($insumos as $item) {
                $receta->detalles()->create([
                    'insumo_id' => (int) $item['insumo_id'],
                    'cantidad'  => $item['cantidad'],
                ]);
            }

            // ── 3. Persistir costo_calculado
            $producto->load('receta.detalles.insumo');
            DB::table('productos')
                ->where('id', $producto->id)
                ->update(['costo_calculado' => $producto->costo]);
        });
    }

    private function syncInsumosDomicilio(Producto $producto, ?array $insumos): void
    {
        if (is_null($insumos)) return;

        $sync = [];
        foreach ($insumos as $item) {
            $sync[(int) $item['insumo_id']] = ['cantidad' => $item['cantidad']];
        }
        $producto->insumosDomicilio()->sync($sync);
    }

    // ─── Endpoints

    public function index(Request $request)
    {
        $query = Producto::with('categoria', 'insumos', 'receta.detalles.insumo', 'insumosDomicilio');

        if ($request->filled('buscar')) {
            $query->where('nombre', 'like', '%' . $request->buscar . '%');
        }

        if ($request->filled('categoria_id')) {
            $query->where('categoria_id', $request->categoria_id);
        }

        // Ruta sin paginar: usada por el POS de pedidos (no necesita datos de costo)
        if ($request->boolean('todos')) {
            return response()->json(
                Producto::with('categoria', 'insumos')
                    ->when($request->filled('buscar'), fn($q) =>
                    $q->where('nombre', 'like', '%' . $request->buscar . '%'))
                    ->get()
            );
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
        $data = $request->except('imagen_producto');

        if ($request->hasFile('imagen_producto')) {
            $file = $request->file('imagen_producto');

            $nombreImagen = time() . '_' . $file->getClientOriginalName();
            $rutaDestino = public_path('storage/productos');

            if (!File::exists($rutaDestino)) {
                File::makeDirectory($rutaDestino, 0755, true);
            }

            $manager = new ImageManager(new Driver());
            $manager->decodePath($file->getRealPath())
                ->scaleDown(width: 600)
                ->save($rutaDestino . '/' . $nombreImagen, quality: 60);

            $data['imagen_producto'] = 'storage/productos/' . $nombreImagen;
        }

        $producto = Producto::create($data);
        $this->syncInsumos($producto, $this->parseInsumos($request));
        $this->syncInsumosDomicilio($producto, $this->parseInsumosDomicilio($request));

        return response()->json(
            $producto->load('categoria', 'insumos', 'receta.detalles.insumo', 'insumosDomicilio'),
            201
        );
    }


    public function update(ProductoRequest $request, $id)
    {
        $producto = Producto::findOrFail($id);
        $data     = $request->except('imagen_producto');

        if ($request->hasFile('imagen_producto')) {
            if ($producto->imagen_producto) {
                $rutaAnterior = public_path($producto->imagen_producto);
                if (File::exists($rutaAnterior)) {
                    File::delete($rutaAnterior);
                }
            }

            $file = $request->file('imagen_producto');
            $nombreImagen = time() . '_' . $file->getClientOriginalName();
            $rutaDestino = public_path('storage/productos');

            if (!File::exists($rutaDestino)) {
                File::makeDirectory($rutaDestino, 0755, true);
            }

            $manager = new ImageManager(new Driver());
            $manager->decodePath($file->getRealPath())
                ->scaleDown(width: 600)
                ->save($rutaDestino . '/' . $nombreImagen, quality: 60);

            $data['imagen_producto'] = 'storage/productos/' . $nombreImagen;
        }

        $producto->update($data);
        $this->syncInsumos($producto, $this->parseInsumos($request));
        $this->syncInsumosDomicilio($producto, $this->parseInsumosDomicilio($request));

        return response()->json(
            $producto->load('categoria', 'insumos', 'receta.detalles.insumo', 'insumosDomicilio')
        );
    }

    public function destroy($id)
    {
        $producto = Producto::findOrFail($id);

        if ($producto->imagen_producto) {
            Storage::disk('public')->delete($producto->imagen_producto);
        }

        $producto->delete(); // SoftDelete

        return response()->json(['message' => 'Producto eliminado']);
    }
}
