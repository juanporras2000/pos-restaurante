<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\PedidoDetalle;
use App\Models\Pago;
use App\Traits\BelongsToTenant;

class Pedido extends Model
{
    use SoftDeletes, BelongsToTenant;

     protected $fillable = [
        'user_id',
        'tipo',
        'numero_mesa',
        'direccion',
        'nombre_cliente',
        'total',
        'estado',
        'razon_eliminacion',
        'tenant_id',
    ];

    protected $appends = ['numero_dia'];

    /**
     * Calcula el número secuencial del pedido dentro de la jornada (5 AM a 5 AM).
     */
    public function getNumeroDiaAttribute()
    {
        if (!$this->created_at) {
            return null;
        }

        // La jornada inicia a la hora configurada (por defecto 5 AM)
        $horaCierre = (int) Configuracion::get('hora_cierre', 5);

        // Convertimos created_at (UTC) a Colombia
        $fechaLocal = $this->created_at->setTimezone('America/Bogota');
        
        // Si es antes de la hora de cierre, pertenece a la jornada del día anterior
        if ($fechaLocal->hour < $horaCierre) {
            $inicioJornada = $fechaLocal->copy()->subDay()->hour($horaCierre)->minute(0)->second(0);
        } else {
            $inicioJornada = $fechaLocal->copy()->hour($horaCierre)->minute(0)->second(0);
        }
        
        $finJornada = $inicioJornada->copy()->addDay()->subSecond();

        // Convertimos los rangos de vuelta a UTC para la consulta en BD
        $inicioUTC = $inicioJornada->utc();
        $finUTC    = $finJornada->utc();

        // Contamos cuántos pedidos se crearon antes que este en la misma jornada
        return self::whereBetween('created_at', [$inicioUTC, $finUTC])
            ->where('id', '<=', $this->id)
            ->count();
    }

    public function detalles()
    {
        return $this->hasMany(PedidoDetalle::class);
    }

    public function pago()
    {
        return $this->hasOne(Pago::class);
    }
}

