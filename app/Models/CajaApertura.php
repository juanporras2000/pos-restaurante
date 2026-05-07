<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CajaApertura extends Model
{
    protected $table = 'caja_aperturas';

    protected $fillable = ['user_id', 'fecha', 'monto', 'nota'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
