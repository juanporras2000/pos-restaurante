<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deuda;
use App\Models\DeudaAbono;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeudaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Deuda::with(['trabajador', 'abonos' => fn($q) => $q->orderByDesc('fecha')])
            ->orderByDesc('fecha');

        if ($request->filled('trabajador_id')) {
            $query->where('trabajador_id', $request->query('trabajador_id'));
        }

        if ($request->query('estado') === 'pendiente') {
            $query->where('saldo', '>', 0);
        } elseif ($request->query('estado') === 'pagada') {
            $query->where('saldo', '<=', 0);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'trabajador_id' => 'required|exists:trabajadores,id',
            'tipo'          => 'required|in:prestamo,compra,otro',
            'concepto'      => 'required|string|max:150',
            'monto_total'   => 'required|integer|min:1',
            'fecha'         => 'required|date_format:Y-m-d',
            'observaciones' => 'nullable|string',
        ]);

        $deuda = Deuda::create([
            ...$data,
            'saldo' => $data['monto_total'],
        ]);

        return response()->json($deuda->load('trabajador'), 201);
    }

    public function destroy(Deuda $deuda): JsonResponse
    {
        $deuda->delete();

        return response()->json(['message' => 'Deuda eliminada']);
    }

    public function storeAbono(Request $request, Deuda $deuda): JsonResponse
    {
        $data = $request->validate([
            'monto' => 'required|integer|min:1',
            'fecha' => 'required|date_format:Y-m-d',
        ]);

        if ($data['monto'] > $deuda->saldo) {
            throw ValidationException::withMessages([
                'monto' => "El monto excede el saldo pendiente ({$deuda->saldo}).",
            ]);
        }

        $abono = DB::transaction(function () use ($deuda, $data) {
            $abono = DeudaAbono::create([
                'deuda_id' => $deuda->id,
                'monto'    => $data['monto'],
                'fecha'    => $data['fecha'],
                'origen'   => 'manual',
            ]);

            $deuda->decrement('saldo', $data['monto']);

            return $abono;
        });

        return response()->json($abono->fresh('deuda'), 201);
    }

    public function destroyAbono(DeudaAbono $abono): JsonResponse
    {
        DB::transaction(function () use ($abono) {
            $abono->deuda->increment('saldo', $abono->monto);
            $abono->delete();
        });

        return response()->json(['message' => 'Abono eliminado']);
    }
}
