<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permiso extends Model {
    protected $table = 'permiso';
    protected $primaryKey = 'id_permiso';
    protected $fillable = ['descripcion'];

    public function perfiles() {
        return $this->belongsToMany(Perfil::class, 'perfil_permiso', 'id_permiso', 'id_perfil');
    }
}
