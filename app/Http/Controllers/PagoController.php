<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Pedido;
use App\Models\Pago;
use App\Services\PagoService;

class PagoController extends Controller
{
    public function __construct(private readonly PagoService $pagoService) {}

    public function store(Request $request): JsonResponse
    {
        $this->validarRequest($request);

        $pedido = Pedido::find($request->pedido_id);
        $error  = $this->verificarPedido($pedido);
        if ($error) {
            return $error;
        }

        try {
            $splits = $request->has('splits')
                ? $this->pagoService->prepararSplits($request->splits)
                : $this->pagoService->normalizarLegacy(
                    (float) $pedido->total,
                    $request->metodo_pago,
                    (float) $request->recibido
                );

            $pago = $this->pagoService->registrar($pedido, $splits);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 400, $pedido);
        }

        return response()->json([
            'mensaje' => 'Pago realizado correctamente',
            'pago'    => $pago,
            'cambio'  => $pago->cambio,
        ], 201);
    }

    public function update(Request $request, Pago $pago): JsonResponse
    {
        $request->validate([
            'metodo_pago' => 'required|string|in:efectivo,nequi,tarjeta,transferencia,mixto',
        ]);

        $pago->update(['metodo_pago' => $request->metodo_pago]);

        return response()->json(['pago' => $pago]);
    }

    private function validarRequest(Request $request): void
    {
        if ($request->has('splits')) {
            $request->validate([
                'pedido_id'            => 'required|integer',
                'splits'               => 'required|array|min:1',
                'splits.*.metodo_pago' => 'required|string|in:efectivo,nequi,tarjeta,transferencia',
                'splits.*.monto'       => 'required|numeric|min:0.01',
                'splits.*.recibido'    => 'required|numeric|min:0',
            ]);
        } else {
            $request->validate([
                'pedido_id'   => 'required|integer',
                'recibido'    => 'required|numeric|min:0',
                'metodo_pago' => 'required|string|in:efectivo,nequi,tarjeta,transferencia',
            ]);
        }
    }

    private function verificarPedido(?Pedido $pedido): ?JsonResponse
    {
        if (!$pedido) {
            return response()->json(['error' => 'Pedido no encontrado'], 404);
        }

        if ($pedido->estado === 'pagado') {
            return response()->json(['error' => 'El pedido ya está pagado'], 400);
        }

        return null;
    }
}
