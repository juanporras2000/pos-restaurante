<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\Api\ProductoController;



    Route::post('pagos', [PagoController::class, 'store']);
    Route::post('pedidos', [PedidoController::class, 'store']);
    Route::get('/reporte-diario', [ReporteController::class, 'diario']);
    
    Route::get('/productos', [ProductoController::class, 'index']);
    Route::post('/productos', [ProductoController::class, 'store']);
