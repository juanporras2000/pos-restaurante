<?php

namespace App\Services;

use App\Models\Producto;
use App\Models\Receta;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Http\UploadedFile;

class ProductoService
{
    /**
     * Procesa y guarda la imagen del producto aplicando compresión y redimensión.
     */
    public function procesarImagen(UploadedFile $file, ?string $rutaAnterior = null): string
    {
        if ($rutaAnterior) {
            $rutaCompletaAnterior = public_path($rutaAnterior);
            if (File::exists($rutaCompletaAnterior)) {
                File::delete($rutaCompletaAnterior);
            }
        }

        $nombreImagen = time() . '_' . $file->getClientOriginalName();
        $rutaDestino = public_path('storage/productos');

        if (!File::exists($rutaDestino)) {
            File::makeDirectory($rutaDestino, 0755, true);
        }

        $manager = new ImageManager(new Driver());
        $manager->decodePath($file->getRealPath())
            ->scaleDown(width: 600)
            ->save($rutaDestino . '/' . $nombreImagen, quality: 60);

        return 'storage/productos/' . $nombreImagen;
    }

    /**
     * Registra un producto con sus recetas y relaciones correspondientes.
     */
    public function crearProducto(array $datos, ?UploadedFile $imagen, ?array $insumos, ?array $insumosDomicilio): Producto
    {
        if ($imagen) {
            $datos['imagen_producto'] = $this->procesarImagen($imagen);
        }

        return DB::transaction(function () use ($datos, $insumos, $insumosDomicilio) {
            $producto = Producto::create($datos);

            $this->syncInsumos($producto, $insumos);
            $this->syncInsumosDomicilio($producto, $insumosDomicilio);

            return $producto;
        });
    }

    /**
     * Actualiza un producto existente, administrando el ciclo de vida de su imagen.
     */
    public function actualizarProducto(Producto $producto, array $datos, ?UploadedFile $imagen, ?array $insumos, ?array $insumosDomicilio): Producto
    {
        if ($imagen) {
            $datos['imagen_producto'] = $this->procesarImagen($imagen, $producto->imagen_producto);
        }

        return DB::transaction(function () use ($producto, $datos, $insumos, $insumosDomicilio) {
            $producto->update($datos);

            $this->syncInsumos($producto, $insumos);
            $this->syncInsumosDomicilio($producto, $insumosDomicilio);

            return $producto;
        });
    }

    /**
     * Elimina físicamente la imagen y aplica SoftDelete al producto.
     */
    public function eliminarProducto(Producto $producto): void
    {
        if ($producto->imagen_producto) {
            Storage::disk('public')->delete($producto->imagen_producto);
        }

        $producto->delete();
    }

    /**
     * Sincroniza la receta canónica e intermedia del producto.
     */
    private function syncInsumos(Producto $producto, ?array $insumos): void
    {
        if (is_null($insumos)) return;

        $sync = [];
        foreach ($insumos as $item) {
            $sync[(int) $item['insumo_id']] = ['cantidad' => $item['cantidad']];
        }
        $producto->insumos()->sync($sync);

        $receta = Receta::withoutGlobalScopes()->updateOrCreate(
            ['producto_id' => $producto->id],
            ['tenant_id'   => $producto->tenant_id]
        );

        $receta->detalles()->delete();

        foreach ($insumos as $item) {
            $receta->detalles()->create([
                'insumo_id' => (int) $item['insumo_id'],
                'cantidad'  => $item['cantidad'],
            ]);
        }

        $producto->load('receta.detalles.insumo');
        DB::table('productos')
            ->where('id', $producto->id)
            ->update(['costo_calculado' => $producto->costo]);
    }

    /**
     * Sincroniza los insumos para despacho a domicilio.
     */
    private function syncInsumosDomicilio(Producto $producto, ?array $insumos): void
    {
        if (is_null($insumos)) return;

        $sync = [];
        foreach ($insumos as $item) {
            $sync[(int) $item['insumo_id']] = ['cantidad' => $item['cantidad']];
        }
        $producto->insumosDomicilio()->sync($sync);
    }
}
