<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class AssignUserIdToPedidos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pedidos:assign-user-id';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign user_id to existing orders that don\'t have one';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $pedidosSinUserId = \App\Models\Pedido::whereNull('user_id')->count();

        if ($pedidosSinUserId === 0) {
            $this->info('No orders found without user_id');
            return;
        }

        // Get the first user (assuming it's the admin)
        $user = \App\Models\User::first();

        if (!$user) {
            $this->error('No users found in the database');
            return;
        }

        \App\Models\Pedido::whereNull('user_id')->update(['user_id' => $user->id]);

        $this->info("Assigned user_id {$user->id} to {$pedidosSinUserId} orders");
    }
}
