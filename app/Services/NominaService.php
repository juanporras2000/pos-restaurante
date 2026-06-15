<?php

namespace App\Services;

use App\Models\Trabajador;
use Illuminate\Support\Collection;

class NominaService
{
    /**
     * Resumen de nómina para todos los trabajadores activos en un rango de fechas.
     *
     * @return Collection<int, array{trabajador: Trabajador, dias: array<string>, dias_count: int, total_pagar: int}>
     */
    public function resumenEnRango(string $fechaInicio, string $fechaFin): Collection
    {
        $trabajadores = Trabajador::with([
            'asistencias' => fn($q) => $q->whereBetween('fecha', [$fechaInicio, $fechaFin])
                                         ->orderBy('fecha'),
        ])->get();

        return $trabajadores->map(fn(Trabajador $t) => $this->calcularTrabajador($t));
    }

    private function calcularTrabajador(Trabajador $trabajador): array
    {
        $dias = $trabajador->asistencias
            ->pluck('fecha')
            ->map(fn($f) => is_string($f) ? $f : $f->format('Y-m-d'))
            ->values()
            ->all();

        $diasCount = count($dias);

        return [
            'trabajador'   => $trabajador,
            'dias'         => $dias,
            'dias_count'   => $diasCount,
            'total_pagar'  => $diasCount * $trabajador->pago_por_turno,
        ];
    }
}
