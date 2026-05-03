<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\InsumoController;
use App\Http\Controllers\Api\ConfiguracionController;
use App\Http\Controllers\Api\InventarioController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;


    Route::post('/login', [AuthenticatedSessionController::class, 'store']);


    Route::post('pagos', [PagoController::class, 'store']);
    Route::get('pedidos/pendientes', [PedidoController::class, 'pendientes']);
    Route::post('pedidos', [PedidoController::class, 'store']);
    Route::put('pedidos/{pedido}', [PedidoController::class, 'update']);
    Route::delete('pedidos/{pedido}', [PedidoController::class, 'destroy']);
    Route::get('/reportes/ventas',                [ReporteController::class, 'ventas']);
    Route::get('/reportes/ventas-por-fecha',      [ReporteController::class, 'ventasPorFecha']);
    Route::get('/reportes/productos-top',         [ReporteController::class, 'productosTop']);
    Route::get('/reportes/productos-mas-vendidos',[ReporteController::class, 'productosTop']);
    Route::get('/reportes/ingresos',              [ReporteController::class, 'ingresos']);
    Route::get('/reportes/ganancias',             [ReporteController::class, 'ganancias']);
    Route::get('/reportes/metodos-pago',          [ReporteController::class, 'metodosPago']);
    Route::get('/reportes/stock',                 [ReporteController::class, 'stockInsumos']);
    Route::get('/reportes/insumos-top',           [ReporteController::class, 'insumosTop']);
    Route::get('/reportes/insumos-uso',           [ReporteController::class, 'insumosTop']);
    Route::get('/reporte-diario',                 [ReporteController::class, 'diario']);

    Route::get('/productos', [ProductoController::class, 'index']);
    Route::post('/productos', [ProductoController::class, 'store']);
    Route::get('/productos/{producto}', [ProductoController::class, 'show']);
    Route::put('/productos/{producto}', [ProductoController::class, 'update']);
    Route::delete('/productos/{producto}', [ProductoController::class, 'destroy']);

    Route::get('/categorias', [CategoriaController::class, 'index']);
    Route::get('/insumos', [InsumoController::class, 'index']);
    Route::post('/insumos', [InsumoController::class, 'store']);
    Route::put('/insumos/{insumo}', [InsumoController::class, 'update']);
    Route::delete('/insumos/{insumo}', [InsumoController::class, 'destroy']);

    Route::get('/inventario/movimientos', [InventarioController::class, 'movimientos']);
    Route::post('/inventario/ajuste', [InventarioController::class, 'ajuste']);
    Route::get('/inventario/alertas', [InventarioController::class, 'alertas']);

    Route::get('/configuraciones', [ConfiguracionController::class, 'index']);
    Route::put('/configuraciones', [ConfiguracionController::class, 'update']);

