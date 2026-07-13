<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\BelongsToTenant;

class Asistencia extends Model
{
    use BelongsToTenant;

    protected $table = 'asistencias';

    protected $fillable = [
        'tenant_id',
        'trabajador_id',
        'fecha',
    ];

    protected $casts = [
        'fecha' => 'date:Y-m-d',
    ];

    public function trabajador(): BelongsTo
    {
        return $this->belongsTo(Trabajador::class);
    }
}
