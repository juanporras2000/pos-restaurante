<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\InventarioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\InventarioActualizado;

class InventarioController extends Controller
{
    // Inyectamos el servicio mediante PHP 8
    public function __construct(private readonly InventarioService $inventarioService) {}

    public function movimientos(Request $request)
    {
        $movimientos = $this->inventarioService->obtenerMovimientos(
            $request->query('insumo_id'),
            $request->integer('per_page', 50)
        );

        return response()->json($movimientos);
    }

    public function ajuste(Request $request)
    {
        $request->validate([
            'insumo_id' => 'required|exists:insumos,id',
            'tipo'      => 'required|in:entrada,ajuste',
            'cantidad'  => 'required|numeric|min:0.01',
            'motivo'    => 'nullable|string|max:255',
        ]);

        $insumo = $this->inventarioService->procesarAjuste(
            $request->only(['insumo_id', 'tipo', 'cantidad', 'motivo']),
            Auth::id()
        );

        $this->transmitirAlertasActuales();

        return response()->json($insumo);
    }

    public function alertas()
    {
        $insumos = $this->inventarioService->obtenerAlertasStock();

        return response()->json($insumos);
    }

    public function transmitirAlertasActuales(): void
    {
        // Obtenemos la lista actualizada usando tu método existente
        $alertas = $this->inventarioService->obtenerAlertasStock()->toArray();

        // Despachamos el evento a través de Reverb
        broadcast(new InventarioActualizado($alertas));
    }
}
