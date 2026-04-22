<?php

namespace App\Http\Controllers;

use App\Models\Conversacion;
use App\Services\IAService;
use App\Services\PedidoIAService;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppController extends Controller
{
    public function __construct(
        protected IAService $iaService,
        protected PedidoIAService $pedidoIAService,
        protected WhatsAppService $whatsappService
    ) {}

    public function verify(Request $request)
    {
        if (
            $request->hub_mode === 'subscribe' &&
            $request->hub_verify_token === env('WHATSAPP_VERIFY_TOKEN')
        ) {
            return response($request->hub_challenge, 200);
        }

        return response('Error de verificaciÃ³n', 403);
    }

    public function webhook(Request $request)
    {
        $mensajeUsuario = $this->extraerMensaje($request);
        $telefono       = $this->extraerTelefono($request);

        // Ignorar silenciosamente notificaciones de estado de Meta (lecturas, entregas)
        if (!$mensajeUsuario || !$telefono) {
            return response()->json(['status' => 'ignored']);
        }

        Log::info('Mensaje WhatsApp recibido:', [
            'telefono' => $telefono,
            'mensaje'  => $mensajeUsuario,
        ]);

        try {
            // 1. Obtener historial reciente (contexto para la IA)
            $historial = Conversacion::where('telefono', $telefono)
                ->whereNotNull('mensaje') // Solo mensajes reales, no el registro de estado
                ->where('created_at', '>=', now()->subHours(2))
                ->latest()
                ->take(8)
                ->get()
                ->reverse()
                ->values()
                ->toArray();

            // 2. PASO 1 DE IA: Interpretar el mensaje â†’ obtener intenciÃ³n estructurada
            $intent = $this->iaService->interpretarMensaje($mensajeUsuario, $historial);

            Log::info('Intent interpretado:', [
                'telefono' => $telefono,
                'intent'   => $intent,
            ]);

            // 3. Lógica de negocio: procesar el intent y actualizar el carrito/pedido
            $resultado = $this->pedidoIAService->procesarIntent($intent, $telefono, $mensajeUsuario);

            // 4. PASO 2 DE IA: Generar respuesta natural basada en el resultado
            $mensajeFinal = $this->iaService->generarRespuestaFinal($resultado);

            // 5. Guardar en bitÃ¡cora
            Conversacion::create([
                'telefono' => $telefono,
                'mensaje'  => $mensajeUsuario,
                'respuesta' => $mensajeFinal,
                'estado'   => $resultado['estado'] ?? 'procesado',
                'carrito'  => $resultado['carrito'] ?? [],
            ]);

            // 6. Enviar respuesta al cliente por WhatsApp
            $this->whatsappService->enviarMensaje($telefono, $mensajeFinal);

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('Error crÃ­tico WhatsAppController: ' . $e->getMessage(), [
                'telefono' => $telefono,
                'trace'    => $e->getTraceAsString(),
            ]);

            $this->whatsappService->enviarMensaje(
                $telefono,
                "QuÃ© pena, tuve un problemita procesando tu mensaje. Â¿Me lo repites por favor?"
            );

            return response()->json(['status' => 'error'], 500);
        }
    }

    protected function extraerMensaje(Request $request): ?string
    {
        return $request->input('entry.0.changes.0.value.messages.0.text.body') // Meta API
            ?? $request->input('Body')    // Twilio
            ?? $request->input('message') // GenÃ©rico
            ?? $request->input('mensaje');
    }

    protected function extraerTelefono(Request $request): ?string
    {
        return $request->input('entry.0.changes.0.value.messages.0.from') // Meta API
            ?? $request->input('From')    // Twilio
            ?? $request->input('sender')
            ?? $request->input('phone')
            ?? $request->input('telefono');
    }
}

