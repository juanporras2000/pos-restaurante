<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class Gasto extends Model
{
    use BelongsToTenant;

    protected $fillable = ['user_id', 'concepto', 'tipo', 'monto', 'nota', 'tenant_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
