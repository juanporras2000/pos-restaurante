<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    /**
     * Se ejecuta en TODA query de un modelo que use BelongsToTenant.
     * Si no hay tenant en contexto (ej: comando artisan), no filtra.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (app()->has('tenant_id')) {
            $builder->where($model->getTable() . '.tenant_id', app('tenant_id'));
        }
    }
}
