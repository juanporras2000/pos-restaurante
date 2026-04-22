<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected ?string $apiUrl;
    protected ?string $accessToken;
    protected ?string $phoneNumberId;

    public function __construct()
    {
        // Se asume integración con Meta (WhatsApp Cloud API) por defecto
        // Estas variables deben configurarse en el .env
        $this->apiUrl = config('services.whatsapp.url', 'https://graph.facebook.com/v17.0');
        $this->accessToken = config('services.whatsapp.token');
        $this->phoneNumberId = config('services.whatsapp.phone_number_id');

        if (!$this->accessToken || !$this->phoneNumberId) {
            Log::warning('WhatsAppService: Credenciales no configuradas en el archivo .env');
        }
    }

    /**
     * Envía un mensaje de texto simple por WhatsApp.
     *
     * @param string $telefono Número de teléfono con código de país (ej: 573001234567)
     * @param string $mensaje Contenido del mensaje
     * @return array
     */
    public function enviarMensaje(string $telefono, string $mensaje): array
    {
        if (!$this->accessToken || !$this->phoneNumberId) {
            return ['success' => false, 'error' => 'Servicio de WhatsApp no configurado'];
        }

        $url = "{$this->apiUrl}/{$this->phoneNumberId}/messages";

        try {
            Log::info("Enviando mensaje de WhatsApp a {$telefono}");

            $response = Http::withToken($this->accessToken)
                ->post($url, [
                    'messaging_product' => 'whatsapp',
                    'to' => $telefono,
                    'type' => 'text',
                    'text' => [
                        'body' => $mensaje
                    ]
                ]);

            $result = $response->json();

            if ($response->successful()) {
                Log::info("WhatsApp enviado satisfactoriamente a {$telefono}", ['response' => $result]);
                return ['success' => true, 'data' => $result];
            }

            Log::error("Error al enviar WhatsApp a {$telefono}", ['response' => $result]);
            return ['success' => false, 'error' => $result['error']['message'] ?? 'Error desconocido'];

        } catch (\Exception $e) {
            Log::error("Excepción al enviar WhatsApp a {$telefono}: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
