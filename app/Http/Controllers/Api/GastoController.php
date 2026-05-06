<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gasto;
use Illuminate\Http\Request;
use Carbon\Carbon;

class GastoController extends Controller
{
    public function index(Request $request)
    {
        $fecha = $request->query('fecha')
            ? Carbon::parse($request->query('fecha'), 'America/Bogota')
            : Carbon::now('America/Bogota');

        $inicio = $fecha->copy()->startOfDay()->utc();
        $fin    = $fecha->copy()->endOfDay()->utc();

        $gastos = Gasto::with('user:id,name')
            ->whereBetween('created_at', [$inicio, $fin])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'gastos' => $gastos,
            'total'  => $gastos->sum('monto'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'concepto' => 'required|string|max:255',
            'tipo'     => 'required|in:insumos,gasolina,servicios,otro',
            'monto'    => 'required|numeric|min:0.01',
            'nota'     => 'nullable|string|max:500',
        ]);

        $gasto = Gasto::create([
            ...$data,
            'user_id' => auth()->id(),
        ]);

        return response()->json($gasto->load('user:id,name'), 201);
    }

    public function update(Request $request, Gasto $gasto)
    {
        $data = $request->validate([
            'concepto' => 'required|string|max:255',
            'tipo'     => 'required|in:insumos,gasolina,servicios,otro',
            'monto'    => 'required|numeric|min:0.01',
            'nota'     => 'nullable|string|max:500',
        ]);

        $gasto->update($data);

        return response()->json($gasto->load('user:id,name'));
    }

    public function destroy(Gasto $gasto)
    {
        $gasto->delete();
        return response()->json(['message' => 'Gasto eliminado']);
    }
}
