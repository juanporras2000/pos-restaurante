<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gasto extends Model
{
    protected $fillable = ['user_id', 'concepto', 'tipo', 'monto', 'nota'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
