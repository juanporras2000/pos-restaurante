<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class Perfil extends Model {
    use BelongsToTenant;
    protected $table = 'perfil';
    protected $primaryKey = 'id_perfil';
    protected $fillable = ['nombre', 'pin', 'id_imagen', 'id_user', 'id_rol', 'tenant_id'];

    public function rol() {
        return $this->belongsTo(Rol::class, 'id_rol');
    }

    public function permisos() {
        return $this->belongsToMany(Permiso::class, 'perfil_permiso', 'id_perfil', 'id_permiso');
    }

    public function users() {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function imagen(){
        return $this->belongsTo(ImagenPerfil::class, 'id_imagen');
    }
}
