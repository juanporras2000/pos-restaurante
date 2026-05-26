<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PedidoCreado implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $pedido;

    /**
     * El constructor recibe el objeto del pedido que se acaba de crear.
     */
    public function __construct($pedido)
    {
        $this->pedido = $pedido;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('pedidos-canal'),
        ];
    }

    /**
     * El nombre exacto del evento que buscará Laravel Echo.
     */
    public function broadcastAs(): string
    {
        return 'PedidoCreadoEvent';
    }
}
