@extends('layouts.pos') {{-- Reemplaza por la ruta exacta a tu layout si difiere --}}

@section('content')
    <div class="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 max-w-md shadow-md">
            <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>

            <h1 class="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h1>
            <p class="text-gray-600 mb-6">
                Tu perfil no cuenta con permisos asignados en el sistema. Por favor, comunícate con el administrador de la
                cuenta para que te otorgue los accesos necesarios.
            </p>

            <button type="button" onclick="cerrarPerfilFronend()"
                class="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors duration-200 w-full sm:w-auto">
                Volver a Perfiles
            </button>
        </div>
    </div>
@endsection
