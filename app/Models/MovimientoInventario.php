<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class MovimientoInventario extends Model
{
    use BelongsToTenant;

    protected $table = 'movimientos_inventario';

    protected $fillable = [
        'insumo_id',
        'user_id',
        'pedido_id',
        'tipo',
        'cantidad',
        'stock_antes',
        'stock_despues',
        'motivo',
        'tenant_id',
    ];

    public function insumo()
    {
        return $this->belongsTo(Insumo::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pedido()
    {
        return $this->belongsTo(Pedido::class);
    }
}
