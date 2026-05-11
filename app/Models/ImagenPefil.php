<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImagenPerfil extends Model
{
    protected $table = 'imagenes_perfil';

    public function perfiles()
    {
        return $this->hasMany(Perfil::class, 'id_imagen');
    }
}
