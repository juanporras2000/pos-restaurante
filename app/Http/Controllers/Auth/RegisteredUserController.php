<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use App\Models\Rol;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): View
    {
        return view('auth.register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nombre_restaurante' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // 1. Crear el tenant (restaurante)
        $slug = Str::slug($request->nombre_restaurante);
        // Si el slug ya existe, agregar sufijo único
        $baseSlug = $slug;
        $i = 1;
        while (Tenant::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $i++;
        }

        $tenant = Tenant::create([
            'nombre' => $request->nombre_restaurante,
            'slug'   => $slug,
            'plan'   => 'gratis',
            'activo' => true,
        ]);

        // 2. Registrar el tenant en el contenedor para que los seeders de datos iniciales funcionen
        app()->instance('tenant_id', $tenant->id);

        // 3. Crear el usuario propietario ligado al tenant
        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'tenant_id' => $tenant->id,
        ]);

        // 4. Sembrar datos iniciales del tenant (roles y configuraciones)
        $this->seedTenantDefaults($tenant->id);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

    /**
     * Crea los datos mínimos que necesita un tenant recién creado:
     * roles base y configuraciones por defecto.
     */
    private function seedTenantDefaults(int $tenantId): void
    {
        // Roles por defecto
        Rol::insert([
            ['nombre' => 'Administrador', 'tenant_id' => $tenantId, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Mesero',        'tenant_id' => $tenantId, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Configuraciones por defecto
        Configuracion::set('recargo_domicilio',  0,              'Recargo fijo (en pesos) que se suma al costo de todo pedido a domicilio.');
        Configuracion::set('hora_cierre',        5,              'Hora (0-23) a la que se cierra la jornada del día anterior.');
        Configuracion::set('nombre_negocio',     $tenant->nombre, 'Nombre del negocio que aparece en los recibos.');
        Configuracion::set('telefono_negocio',   '',             'Teléfono de contacto que aparece en los recibos.');
        Configuracion::set('direccion_negocio',  '',             'Dirección del negocio que aparece en los recibos.');
    }
}
