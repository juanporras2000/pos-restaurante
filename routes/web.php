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

    Route::get('/pedidos', function () {
        return view('pedidos');
    })->name('pedidos');

    Route::get('/pagos', function () {
        return view('pagos');
    });

    Route::get('/reportes', function () {
        return view('reportes');
    })->name('reportes');

     Route::get('/productos', function () {
        return view('productos');
    });

    Route::get('/insumos', function () {
        return view('insumos');
    });

});

require __DIR__.'/auth.php';
