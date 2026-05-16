<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth'])->group(function () {

    Route::middleware(['guest.perfil'])->group(function () {
        Route::get('/perfiles', function () {
            return view('perfiles');
        });
    });

    Route::middleware(['check.perfil'])->group(function () {

        Route::get('/pedidos', function () {
            return view('pedidos');
        })->middleware('permiso:1')->name('pedidos');

        Route::get('/pagos', function () {
            return view('pagos');
        })->middleware('permiso:1');

        Route::get('/productos', function () {
            return view('productos');
        })->middleware('permiso:2');

        Route::get('/reportes', function () {
            return view('reportes');
        })->middleware('permiso:3')->name('reportes');

        Route::get('/gastos', function () {
            return view('gastos');
        })->middleware('permiso:4')->name('gastos');

        Route::get('/insumos', function () {
            return view('insumos');
        })->middleware('permiso:5');

        Route::get('/configuraciones', function () {
            return view('configuraciones');
        })->middleware('permiso:6')->name('configuraciones');
    });
});

require __DIR__ . '/auth.php';
