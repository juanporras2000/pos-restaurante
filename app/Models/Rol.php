<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class Rol extends Model {
    use BelongsToTenant;
    protected $table = 'rol';
    protected $primaryKey = 'id_rol';
    protected $fillable = ['nombre', 'tenant_id'];

    public function perfil() {
        return $this->hasOne(Perfil::class, 'id_rol');
    }
}
