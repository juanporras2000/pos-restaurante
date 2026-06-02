<?php

namespace App\Services;

use App\Events\PedidoPagado;
use App\Models\Pago;
use App\Models\PagoDetalle;
use App\Models\Pedido;
use Illuminate\Support\Facades\DB;

class PagoService
{
    /**
     * Registra el pago completo de un pedido con uno o más splits.
     *
     * @param  Pedido  $pedido
     * @param  array   $splits  [['metodo_pago', 'monto', 'recibido', 'cambio'], ...]
     *
     * @throws \InvalidArgumentException si la suma de montos no cubre el total del pedido
     */
    public function registrar(Pedido $pedido, array $splits): Pago
    {
        $total     = (float) $pedido->total;
        $sumaMonto = (float) collect($splits)->sum('monto');

        if (round($sumaMonto, 2) < round($total, 2)) {
            throw new \InvalidArgumentException('El monto total de los pagos no cubre el pedido.');
        }

        return DB::transaction(function () use ($pedido, $splits, $total) {
            $metodos            = array_unique(array_column($splits, 'metodo_pago'));
            $metodoPagoAgregado = count($metodos) === 1 ? $metodos[0] : 'mixto';

            $pago = Pago::create([
                'pedido_id'   => $pedido->id,
                'total'       => $total,
                'recibido'    => (float) collect($splits)->sum('recibido'),
                'cambio'      => (float) collect($splits)->sum('cambio'),
                'metodo_pago' => $metodoPagoAgregado,
            ]);

            foreach ($splits as $split) {
                PagoDetalle::create([
                    'pago_id'     => $pago->id,
                    'metodo_pago' => $split['metodo_pago'],
                    'monto'       => $split['monto'],
                    'recibido'    => $split['recibido'],
                    'cambio'      => $split['cambio'],
                ]);
            }

            $pedido->update(['estado' => 'pagado']);
            event(new PedidoPagado($pedido));

            return $pago->load('detalles');
        });
    }

    /**
     * Prepara y valida splits desde el request (modo pago dividido).
     *
     * @throws \InvalidArgumentException si un split en efectivo no tiene fondos suficientes
     */
    public function prepararSplits(array $rawSplits): array
    {
        return array_map(function (array $s) {
            $monto    = (float) $s['monto'];
            $recibido = (float) $s['recibido'];

            if ($s['metodo_pago'] === 'efectivo' && $recibido < $monto) {
                throw new \InvalidArgumentException(
                    'El dinero recibido en efectivo es insuficiente para el monto asignado.'
                );
            }

            return [
                'metodo_pago' => $s['metodo_pago'],
                'monto'       => $monto,
                'recibido'    => $recibido,
                'cambio'      => $s['metodo_pago'] === 'efectivo' ? max(0.0, $recibido - $monto) : 0.0,
            ];
        }, $rawSplits);
    }

    /**
     * Convierte un pago simple (método único) al formato splits esperado por registrar().
     *
     * @throws \InvalidArgumentException si es efectivo y recibido < total
     */
    public function normalizarLegacy(float $total, string $metodoPago, float $recibido): array
    {
        if ($metodoPago === 'efectivo' && $recibido < $total) {
            throw new \InvalidArgumentException('El dinero recibido es insuficiente.');
        }

        $montoRecibido = $metodoPago === 'efectivo' ? $recibido : $total;
        $cambio        = $metodoPago === 'efectivo' ? max(0.0, $recibido - $total) : 0.0;

        return [[
            'metodo_pago' => $metodoPago,
            'monto'       => $total,
            'recibido'    => $montoRecibido,
            'cambio'      => $cambio,
        ]];
    }
}
