<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\PedidoController;

Route::post('pagos', [PagoController::class, 'store']);
Route::post('pedidos', [PedidoController::class, 'store']);
