<x-guest-layout>
    <div class="mb-8 text-center">
        <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">
            ¡Hola de nuevo!
        </h2>
        <p class="mt-2 text-sm text-gray-600">
            Ingresa tus credenciales para acceder al sistema
        </p>
    </div>

    <!-- Session Status -->
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}" class="space-y-6">
        @csrf

        <!-- Email Address -->
        <div class="space-y-1">
            <x-input-label for="email" :value="__('Correo Electrónico')" class="text-xs font-semibold uppercase tracking-wider text-gray-400" />
            <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-blue-600 transition-colors">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                </div>
                <x-text-input id="email" class="block w-full pl-10 border-gray-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl transition-all duration-200" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" placeholder="ejemplo@correo.com" />
            </div>
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <!-- Password -->
        <div class="space-y-1">
            <div class="flex items-center justify-between">
                <x-input-label for="password" :value="__('Contraseña')" class="text-xs font-semibold uppercase tracking-wider text-gray-400" />
                @if (Route::has('password.request'))
                    <a class="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors" href="{{ route('password.request') }}">
                        ¿Olvidaste tu contraseña?
                    </a>
                @endif
            </div>
            <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-blue-600 transition-colors">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <x-text-input id="password" class="block w-full pl-10 border-gray-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl transition-all duration-200"
                                type="password"
                                name="password"
                                required autocomplete="current-password"
                                placeholder="••••••••" />
            </div>
            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>

        <!-- Remember Me -->
        <div class="flex items-center justify-between">
            <label for="remember_me" class="inline-flex items-center cursor-pointer group">
                <input id="remember_me" type="checkbox" class="rounded border-gray-200 text-blue-600 shadow-sm focus:ring-blue-600 cursor-pointer" name="remember">
                <span class="ms-2 text-sm text-gray-500 group-hover:text-gray-900 transition-colors">{{ __('Mantener sesión iniciada') }}</span>
            </label>
        </div>

        <div>
            <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all active:scale-95 duration-200">
                {{ __('Iniciar Sesión') }}
            </button>
        </div>
    </form>

    @if (Route::has('register'))
        <div class="mt-8 pt-6 border-t border-gray-100 border-dashed text-center">
            <p class="text-sm text-gray-500">
                ¿No tienes una cuenta? 
                <a href="{{ route('register') }}" class="font-bold text-blue-600 hover:text-blue-700 transition-colors ml-1">
                    Regístrate aquí
                </a>
            </p>
        </div>
    @endif
</x-guest-layout>
