<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TenantRegistrationService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules;
use Illuminate\View\View;

class RegisteredUserController extends Controller
{
    // Inyectamos el servicio de registro
    public function __construct(private readonly TenantRegistrationService $registrationService) {}

    /**
     * Display the registration view.
     */
    public function create(): View
    {
        return view('auth.register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nombre_restaurante' => ['required', 'string', 'max:255'],
            'name'               => ['required', 'string', 'max:255'],
            'email'              => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password'           => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Delegamos toda la creación y lógica transaccional al servicio
        $user = $this->registrationService->registrarNuevoTenant(
            $request->only(['nombre_restaurante', 'name', 'email', 'password'])
        );

        event(new Registered($user));

        Auth::login($user);

        return redirect('/perfiles');
    }
}
