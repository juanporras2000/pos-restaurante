<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\BelongsToTenant;

class Trabajador extends Model
{
    use BelongsToTenant;

    protected $table = 'trabajadores';

    protected $fillable = [
        'tenant_id',
        'nombre',
        'cargo',
        'pago_por_turno',
        'activo',
    ];

    protected $casts = [
        'activo'          => 'boolean',
        'pago_por_turno'  => 'integer',
    ];

    public function asistencias(): HasMany
    {
        return $this->hasMany(Asistencia::class);
    }

    public function asistenciasEnRango(string $inicio, string $fin): HasMany
    {
        return $this->asistencias()->whereBetween('fecha', [$inicio, $fin]);
    }

    public function deudas(): HasMany
    {
        return $this->hasMany(Deuda::class);
    }
}
