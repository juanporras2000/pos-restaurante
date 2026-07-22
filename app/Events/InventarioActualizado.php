<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InventarioActualizado implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $alertas;

    /**
     * El constructor recibe las alertas de stock ya filtradas.
     */
    public function __construct(array $alertas)
    {
        $this->alertas = $alertas;
    }

    /**
     * Canal público donde transmitiremos los cambios del inventario.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('inventario-channel'),
        ];
    }

    /**
     * Nombre personalizado del evento en el frontend.
     */
    public function broadcastAs(): string
    {
        return 'inventario.actualizado';
    }
}
