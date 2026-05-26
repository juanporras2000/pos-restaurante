<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PedidoPagado implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $pedido;


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


    public function broadcastAs(): string
    {
        return 'PedidoPagadoEvent';
    }
}
