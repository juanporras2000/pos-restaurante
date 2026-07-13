<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\BelongsToTenant;

class DeudaAbono extends Model
{
    use BelongsToTenant;

    protected $table = 'deuda_abonos';

    protected $fillable = [
        'tenant_id',
        'deuda_id',
        'monto',
        'fecha',
    ];

    protected $casts = [
        'monto' => 'integer',
        'fecha' => 'date:Y-m-d',
    ];

    public function deuda(): BelongsTo
    {
        return $this->belongsTo(Deuda::class);
    }
}
