<?php

namespace App\Services;

use App\Models\DeudaAbono;
use App\Models\Trabajador;
use Illuminate\Support\Collection;

class NominaService
{
    /**
     * Resumen de nómina para todos los trabajadores activos en un rango de fechas.
     * Aplica automáticamente el descuento de deudas pendientes (préstamos/compras)
     * contra lo que cada trabajador tiene por cobrar esa semana, sin exceder su pago bruto.
     *
     * @return Collection<int, array>
     */
    public function resumenEnRango(string $fechaInicio, string $fechaFin): Collection
    {
        $trabajadores = Trabajador::with([
            'asistencias' => fn($q) => $q->whereBetween('fecha', [$fechaInicio, $fechaFin])
                                         ->orderBy('fecha'),
            'deudas',
        ])->get();

        return $trabajadores->map(function (Trabajador $trabajador) use ($fechaInicio, $fechaFin) {
            $dias = $trabajador->asistencias
                ->pluck('fecha')
                ->map(fn($f) => is_string($f) ? $f : $f->format('Y-m-d'))
                ->values()
                ->all();

            $totalPagar = count($dias) * $trabajador->pago_por_turno;

            $this->autoDeducir($trabajador, $fechaInicio, $fechaFin, $totalPagar);

            $trabajador->load([
                'deudas.abonos' => fn($q) => $q->whereBetween('fecha', [$fechaInicio, $fechaFin])
                                                ->orderBy('fecha'),
            ]);

            return $this->calcularTrabajador($trabajador, $dias, $totalPagar);
        });
    }

    /**
     * Descuenta automáticamente de las deudas pendientes del trabajador el máximo
     * posible contra su pago bruto de la semana, sin dejarlo en negativo. Es idempotente:
     * si ya se aplicó (parte de) el descuento para esta semana, solo cubre la diferencia.
     */
    private function autoDeducir(Trabajador $trabajador, string $fechaInicio, string $fechaFin, int $totalPagarBruto): void
    {
        if ($totalPagarBruto <= 0) {
            return;
        }

        $todasDeudasIds = $trabajador->deudas->pluck('id');
        if ($todasDeudasIds->isEmpty()) {
            return;
        }

        $yaDeducidoEstaSemana = DeudaAbono::where('origen', 'auto')
            ->whereIn('deuda_id', $todasDeudasIds)
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->sum('monto');

        $disponible = $totalPagarBruto - $yaDeducidoEstaSemana;
        if ($disponible <= 0) {
            return;
        }

        $deudasPendientes = $trabajador->deudas
            ->where('saldo', '>', 0)
            ->sortBy('fecha');

        foreach ($deudasPendientes as $deuda) {
            if ($disponible <= 0) {
                break;
            }

            $monto = min($disponible, $deuda->saldo);
            if ($monto <= 0) {
                continue;
            }

            DeudaAbono::create([
                'deuda_id' => $deuda->id,
                'monto'    => $monto,
                'fecha'    => $fechaFin,
                'origen'   => 'auto',
            ]);
            $deuda->decrement('saldo', $monto);

            $disponible -= $monto;
        }
    }

    private function calcularTrabajador(Trabajador $trabajador, array $dias, int $totalPagar): array
    {
        $diasCount = count($dias);

        $abonos = $trabajador->deudas->flatMap->abonos->values();
        $totalDescuentos = $abonos->sum('monto');
        $deudasPendientes = $trabajador->deudas->where('saldo', '>', 0)->values();

        return [
            'trabajador'            => $trabajador,
            'dias'                  => $dias,
            'dias_count'            => $diasCount,
            'total_pagar'           => $totalPagar,
            'abonos'                => $abonos,
            'total_descuentos'      => $totalDescuentos,
            'total_neto'            => $totalPagar - $totalDescuentos,
            'deudas_pendientes'     => $deudasPendientes,
            'total_deuda_pendiente' => $deudasPendientes->sum('saldo'),
        ];
    }
}
