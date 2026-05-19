<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\InsumoController;
use App\Http\Controllers\Api\AdicionController;
use App\Http\Controllers\Api\ConfiguracionController;
use App\Http\Controllers\Api\InventarioController;
use App\Http\Controllers\Api\GastoController;
use App\Http\Controllers\Api\CajaAperturaController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\PerfilController;


    Route::post('login', [AuthenticatedSessionController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('pagos', [PagoController::class, 'store']);
    Route::get('pedidos/pendientes', [PedidoController::class, 'pendientes']);
    Route::get('pedidos/cerrados-hoy', [PedidoController::class, 'cerradosHoy']);
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
    Route::get('/reportes/gastos',                [ReporteController::class, 'gastosPorPeriodo']);
    Route::get('/reportes/tipo-pedido',           [ReporteController::class, 'tipoPedido']);
    Route::get('/reporte-diario',                 [ReporteController::class, 'diario']);

    Route::get('/productos', [ProductoController::class, 'index']);
    Route::post('/productos', [ProductoController::class, 'store']);
    Route::get('/productos/{producto}', [ProductoController::class, 'show']);
    Route::put('/productos/{producto}', [ProductoController::class, 'update']);
    Route::delete('/productos/{producto}', [ProductoController::class, 'destroy']);

    Route::get('/categorias', [CategoriaController::class, 'index']);
    Route::post('/categorias', [CategoriaController::class, 'store']);
    Route::put('/categorias/{categoria}', [CategoriaController::class, 'update']);
    Route::delete('/categorias/{categoria}', [CategoriaController::class, 'destroy']);
    Route::get('/insumos', [InsumoController::class, 'index']);
    Route::post('/insumos', [InsumoController::class, 'store']);
    Route::put('/insumos/{insumo}', [InsumoController::class, 'update']);
    Route::delete('/insumos/{insumo}', [InsumoController::class, 'destroy']);

    Route::get('/inventario/movimientos', [InventarioController::class, 'movimientos']);
    Route::post('/inventario/ajuste', [InventarioController::class, 'ajuste']);
    Route::get('/inventario/alertas', [InventarioController::class, 'alertas']);

    Route::get('/gastos', [GastoController::class, 'index']);
    Route::post('/gastos', [GastoController::class, 'store']);
    Route::put('/gastos/{gasto}', [GastoController::class, 'update']);
    Route::delete('/gastos/{gasto}', [GastoController::class, 'destroy']);

    Route::get('/caja-apertura/{fecha}', [CajaAperturaController::class, 'show']);
    Route::post('/caja-apertura', [CajaAperturaController::class, 'store']);

    Route::get('/configuraciones', [ConfiguracionController::class, 'index']);
    Route::put('/configuraciones', [ConfiguracionController::class, 'update']);

    Route::get('/adiciones', [AdicionController::class, 'index']);
    Route::post('/adiciones', [AdicionController::class, 'store']);
    Route::put('/adiciones/{adicion}', [AdicionController::class, 'update']);
    Route::delete('/adiciones/{adicion}', [AdicionController::class, 'destroy']);

    Route::get('/perfiles', [PerfilController::class, 'index']);
    Route::post('/verificar-perfil-pin', [PerfilController::class, 'verificarPin']);
    Route::get('/perfiles-admin', [PerfilController::class, 'indexAdmin']);
    Route::post('/perfiles', [PerfilController::class, 'store']);
    Route::put('/perfiles/{id}', [PerfilController::class, 'update']);
    Route::delete('/perfiles/{id}', [PerfilController::class, 'destroy']);

    Route::get('/permisos-lista', function() {
        return \App\Models\Permiso::all(['id_permiso', 'descripcion']);
    });

    Route::get('/perfiles-data-inicial', [PerfilController::class, 'dataInicialAdmin']);

});
