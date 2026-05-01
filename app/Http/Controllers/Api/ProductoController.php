<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\Receta;
use App\Http\Requests\ProductoRequest;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    /**
     * Normaliza el campo receta/insumos sin importar si llega como JSON string
     * (FormData multipart) o como array (JSON body).
     */
    private function parseInsumos(Request $request): ?array
    {
        $raw = $request->input('receta') ?? $request->input('insumos');
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

            // ── 2. Receta canónica ──────────────────────────────────────────────────
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

            // ── 3. Persistir costo_calculado ────────────────────────────────────────
            $producto->load('receta.detalles.insumo');
            DB::table('productos')
                ->where('id', $producto->id)
                ->update(['costo_calculado' => $producto->costo]);
        });
    }

    // ─── Endpoints ───────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $query = Producto::with('categoria', 'insumos', 'receta.detalles.insumo');

        if ($request->filled('buscar')) {
            $query->where('nombre', 'like', '%' . $request->buscar . '%');
        }

        // Ruta sin paginar: usada por el POS de pedidos (no necesita datos de costo)
        if ($request->boolean('todos')) {
            return response()->json(
                Producto::with('categoria', 'insumos')
                    ->when($request->filled('buscar'), fn ($q) =>
                        $q->where('nombre', 'like', '%' . $request->buscar . '%'))
                    ->get()
            );
        }

        return response()->json($query->paginate(5));
    }

    public function show($id)
    {
        $producto = Producto::with('categoria', 'insumos', 'receta.detalles.insumo')
            ->findOrFail($id);

        return response()->json($producto);
    }

    public function store(ProductoRequest $request)
    {
        $data = $request->except('imagen_producto');

        if ($request->hasFile('imagen_producto')) {
            $data['imagen_producto'] = $request->file('imagen_producto')
                ->store('productos', 'public');
        }

        $producto = Producto::create($data);
        $this->syncInsumos($producto, $this->parseInsumos($request));

        return response()->json(
            $producto->load('categoria', 'insumos', 'receta.detalles.insumo'),
            201
        );
    }

    public function update(ProductoRequest $request, $id)
    {
        $producto = Producto::findOrFail($id);
        $data     = $request->except('imagen_producto');

        if ($request->hasFile('imagen_producto')) {
            if ($producto->imagen_producto) {
                Storage::disk('public')->delete($producto->imagen_producto);
            }
            $data['imagen_producto'] = $request->file('imagen_producto')
                ->store('productos', 'public');
        }

        $producto->update($data);
        $this->syncInsumos($producto, $this->parseInsumos($request));

        return response()->json(
            $producto->load('categoria', 'insumos', 'receta.detalles.insumo')
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
