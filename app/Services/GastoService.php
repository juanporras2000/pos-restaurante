<?php

namespace App\Services;

use App\Models\Gasto;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class GastoService
{
    /**
     * Obtiene los gastos de una fecha específica con su sumatorio total.
     */
    public function obtenerGastosPorFecha(?string $fechaQuery, bool $paginado = false, int $perPage = 15)
    {
        $fecha = $fechaQuery
            ? Carbon::parse($fechaQuery, 'America/Bogota')
            : Carbon::now('America/Bogota');

        $inicio = $fecha->copy()->startOfDay()->utc();
        $fin    = $fecha->copy()->endOfDay()->utc();

        $query = Gasto::with('user:id,name')
            ->whereBetween('created_at', [$inicio, $fin])
            ->orderByDesc('created_at');

        $totalDelDia = (clone $query)->sum('monto');

        $gastosResultado = $paginado
            ? $query->paginate($perPage)
            : $query->get();

        return [
            'gastos' => $gastosResultado,
            'total'  => $totalDelDia,
        ];
    }

    /**
     * Registra un nuevo gasto asociándolo al usuario autenticado.
     */
    public function registrarGasto(array $datos)
    {
        // Aseguramos pasar el ID del usuario directamente
        $gasto = Gasto::create([
            ...$datos,
            'user_id' => Auth::id(),
        ]);

        return $gasto->load('user:id,name');
    }

    /**
     * Actualiza un gasto si pertenece al día actual.
     */
    public function actualizarGasto(Gasto $gasto, array $datos)
    {
        $this->verificarPermisoTemporal($gasto, 'modificar');

        $gasto->update($datos);

        return $gasto->load('user:id,name');
    }

    /**
     * Elimina un gasto si pertenece al día actual.
     */
    public function eliminarGasto(Gasto $gasto)
    {
        $this->verificarPermisoTemporal($gasto, 'eliminar');

        $gasto->delete();
    }

    /**
     * Valida de manera centralizada si el gasto corresponde al día de hoy en Bogotá.
     */
    private function verificarPermisoTemporal(Gasto $gasto, string $accion)
    {
        $hoy = Carbon::now('America/Bogota')->toDateString();
        $fechaGasto = Carbon::parse($gasto->created_at)->setTimezone('America/Bogota')->toDateString();

        if ($fechaGasto !== $hoy) {
            throw ValidationException::withMessages([
                'gasto' => ["Solo se pueden {$accion} gastos del día actual."]
            ]);
        }
    }
}
