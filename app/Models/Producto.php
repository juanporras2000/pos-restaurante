<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Producto extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nombre',
        'precio',
        'activo',
        'categoria_id',
        'imagen_producto',
        'tenant_id',
        'costo_calculado',
    ];

    /**
     * Exponer costo, utilidad y margen en todas las serializaciones JSON.
     * Los accessors son seguros: retornan 0 si la receta no está cargada.
     */
    protected $appends = ['costo', 'utilidad', 'margen'];

    // ─── Relaciones ───────────────────────────────────────────────────────────

    /**
     * Relación legacy con producto_insumo.
     * Usada por el ModalProducto del frontend para mostrar/editar ingredientes.
     */
    public function insumos(): BelongsToMany
    {
        return $this->belongsToMany(Insumo::class, 'producto_insumo')
                    ->withPivot('cantidad')
                    ->withTimestamps();
    }

    /**
     * Receta formal (canonical). Úsala para cálculo de costos.
     * Eager load: with('receta.detalles.insumo')
     */
    public function receta(): HasOne
    {
        return $this->hasOne(Receta::class);
    }

    public function detallesPedido(): HasMany
    {
        return $this->hasMany(PedidoDetalle::class);
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    // ─── Accessors dinámicos ──────────────────────────────────────────────────

    /**
     * Costo calculado en tiempo real a partir de la receta.
     *
     * Requiere: with('receta.detalles.insumo')
     * Si la relación no está cargada, retorna 0 (no genera queries extra).
     * Si hay insumos con costo_unitario = 0 o NULL, se tratan como 0.
     */
    public function getCostoAttribute(): float
    {
        if (! $this->relationLoaded('receta') || $this->receta === null) {
            return 0.0;
        }

        return (float) $this->receta->detalles->sum(
            fn (RecetaDetalle $detalle) =>
                (float) $detalle->cantidad * (float) ($detalle->insumo?->costo_unitario ?? 0)
        );
    }

    /**
     * Utilidad bruta = precio_venta - costo.
     * Puede ser negativa si el producto está mal costeado.
     */
    public function getUtilidadAttribute(): float
    {
        return round((float) $this->precio - $this->costo, 4);
    }

    /**
     * Margen de ganancia en porcentaje.
     * Retorna 0 si el precio es 0 (evita división por cero).
     */
    public function getMargenAttribute(): float
    {
        $precio = (float) $this->precio;

        if ($precio <= 0) {
            return 0.0;
        }

        return round(($this->utilidad / $precio) * 100, 2);
    }
}
