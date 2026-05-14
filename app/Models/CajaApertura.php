<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class CajaApertura extends Model
{
    use BelongsToTenant;

    protected $table = 'caja_aperturas';

    protected $fillable = ['user_id', 'fecha', 'monto', 'nota', 'tenant_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
