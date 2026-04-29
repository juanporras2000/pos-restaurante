<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Perfil extends Model {
    protected $table = 'perfil';
    protected $primaryKey = 'id_perfil';
    protected $fillable = ['nombre', 'pin', 'imagen_perfil', 'id_user', 'id_rol'];

    public function rol() {
        return $this->belongsTo(Rol::class, 'id_rol');
    }

    public function permisos() {
        return $this->belongsToMany(Permiso::class, 'perfil_permiso', 'id_perfil', 'id_permiso');
    }

    public function users() {
    return $this->belongsTo(User::class, 'id_user');
}
}
