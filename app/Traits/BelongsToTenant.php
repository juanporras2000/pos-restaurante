<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use App\Scopes\TenantScope;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        // Aplica el global scope en TODAS las queries del modelo
        static::addGlobalScope(new TenantScope());

        // Al crear un registro, inyecta tenant_id automáticamente
        static::creating(function (Model $model) {
            if (app()->has('tenant_id') && empty($model->tenant_id)) {
                $model->tenant_id = app('tenant_id');
            }
        });
    }

    /**
     * Relación con el tenant propietario del registro.
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Tenant::class);
    }

    /**
     * Scope de escape: permite queries sin filtro de tenant.
     * Usar SÓLO en migraciones/seeders/comandos administrativos.
     */
    public static function sinScopeTenant(): Builder
    {
        return static::withoutGlobalScope(TenantScope::class);
    }
}
