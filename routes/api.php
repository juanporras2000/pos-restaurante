<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\CategoriaController;


    Route::post('pagos', [PagoController::class, 'store']);
    Route::get('pedidos/pendientes', [PedidoController::class, 'pendientes']);
    Route::post('pedidos', [PedidoController::class, 'store']);
    Route::delete('pedidos/{pedido}', [PedidoController::class, 'destroy']);
    Route::get('/reporte-diario', [ReporteController::class, 'diario']);
    
    Route::get('/productos', [ProductoController::class, 'index']);
    Route::post('/productos', [ProductoController::class, 'store']);
    Route::put('/productos/{producto}', [ProductoController::class, 'update']);
    Route::delete('/productos/{producto}', [ProductoController::class, 'destroy']);

    Route::get('/categorias', [CategoriaController::class, 'index']);

