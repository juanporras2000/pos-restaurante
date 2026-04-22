<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IAService
{
    protected string $apiKey;
    protected string $model;
    protected string $apiUrl = 'https://api.openai.com/v1/chat/completions';

    public function __construct()
    {
        $this->apiKey = config('services.openai.key');
        $this->model = config('services.openai.model', 'gpt-3.5-turbo');
    }

    // =========================================================================
    // PASO 1: Interpretar el mensaje → JSON estructurado con intención del cliente
    // =========================================================================

    public function interpretarMensaje(string $mensaje): array
    {
        $systemPrompt = "Eres un sistema de análisis conversacional para un restaurante que recibe pedidos por WhatsApp. Tu única responsabilidad es interpretar el mensaje del cliente y devolver un JSON estructurado que será procesado por el backend.

NO debes responder como asistente.
NO debes generar texto conversacional.
NO debes inventar productos.
NO debes decidir lógica de negocio.
NO debes asumir información que no esté en el mensaje.

---
## DEBES DEVOLVER SIEMPRE ESTE JSON:
{
\"intent\": \"\",
\"accion\": \"\",
\"producto\": null,
\"direccion\": null
}

---
## DEFINICIÓN DE CAMPOS
### intent
* saludo → 'hola', 'buenas'
* consulta → pregunta por productos
* pedido → quiere ordenar algo
* confirmacion → confirma pedido actual
* direccion → proporciona dirección
* otro → cualquier otro caso

### accion
* agregar → añadir producto al pedido actual
* mantener → continuar con lo ya pedido (NO modificar)
* eliminar → quitar producto
* limpiar → reemplazar pedido completo (cambia por, en lugar de)
* confirmar → finalizar pedido (solo, solamente, listo, envíalo)
* ninguno → no aplica acción

---
## EJEMPLOS
Mensaje: 'Solo sería eso'
{ \"intent\": \"confirmacion\", \"accion\": \"confirmar\", \"producto\": null, \"direccion\": null }

Mensaje: 'Cámbialo por un patacon'
{ \"intent\": \"pedido\", \"accion\": \"limpiar\", \"producto\": \"patacon\", \"direccion\": null }

Mensaje: 'Para la carrera 22 #66-66'
{ \"intent\": \"direccion\", \"accion\": \"ninguno\", \"producto\": null, \"direccion\": \"carrera 22 #66-66\" }";

        $data = $this->llamarOpenAI(
            [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => "Analiza este mensaje: {$mensaje}"],
            ],
            0.1
        );

        return $this->validarInterpretacion($data);
    }

    /**
     * Usa la IA para encontrar la coincidencia más cercana en el menú real.
     */
    public function buscarProductoEnMenu(string $nombrePedido, array $productosBD): ?string
    {
        $listaNombres = implode(", ", $productosBD);
        $systemPrompt = "Eres un asistente que ayuda a encontrar productos en un menú.
Te doy una lista de productos reales de la base de datos.
Debes encontrar el producto más cercano al que pide el usuario.

---
PRODUCTOS DISPONIBLES:
{$listaNombres}

---
REGLAS:
* Si hay coincidencia → devolver nombre exacto
* Si no hay → devolver null
* NO inventar productos

---
RESPUESTA (SOLO JSON):
{
\"producto_encontrado\": \"nombre exacto o null\"
}";

        $data = $this->llamarOpenAI(
            [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => "Encuentra el producto: {$nombrePedido}"],
            ],
            0.0
        );

        return $data['producto_encontrado'] ?? null;
    }

    /**
     * Paso 1.2: Decide la acción de negocio basándose en el lenguaje del usuario y el estado.
     */
    public function decidirAccionNegocio(string $mensaje, array $carrito): string
    {
        $productosActuales = implode(", ", array_column($carrito['productos'] ?? [], 'nombre'));
        $systemPrompt = "Eres un sistema que decide cómo modificar un pedido existente.

Te doy:
* mensaje del usuario
* productos actuales

---
Debes decidir:
accion: (agregar, mantener, limpiar, confirmar)

---
REGLAS:
* 'solo', 'solamente' → mantener
* 'cambia por', 'en lugar de' → limpiar
* 'agrega', 'también' → agregar
* 'confirmar', 'listo', 'envíalo' → confirmar

---
RESPUESTA (SOLO JSON):
{
\"accion\": \"...\"
}";

        $data = $this->llamarOpenAI(
            [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => "Mensaje: {$mensaje}\nProductos actuales: [{$productosActuales}]"],
            ],
            0.1
        );

        return $data['accion'] ?? 'agregar';
    }

    // =========================================================================
    // PASO 2: Generar respuesta natural basada en el resultado del procesamiento
    // =========================================================================

    public function generarRespuestaFinal(array $resultado): string
    {
        $system = "Eres un vendedor de restaurante amable, natural y profesional. Tu trabajo es responder al cliente basado SOLO en la información que te doy.

NO inventes productos.
NO cambies el pedido.
NO agregues cosas que no estén en los datos.

---
REGLAS:
- Sé breve y natural
- No repitas frases como '¿le agrego algo más?' en cada respuesta
- No sonar robótico
- Habla como un humano real

---
RESPUESTAS SEGÚN ESTADO:
- Si estado = armando_pedido: confirmar lo que lleva
- Si estado = esperando_direccion: pedir dirección claramente
- Si estado = confirmando: confirmar pedido completo
- Si estado = finalizado: despedida + tiempo estimado";

        $prompt = $this->construirPromptRespuesta($resultado);

        $respuesta = $this->llamarOpenAITexto(
            [
                ['role' => 'system', 'content' => $system],
                ['role' => 'user',   'content' => $prompt],
            ],
            0.7
        );

        return $respuesta ?? '¡Listo! ¿En qué más te puedo ayudar?';
    }

    // =========================================================================
    // Helpers privados
    // =========================================================================

    protected function construirPromptRespuesta(array $r): string
    {
        $estado   = $r['estado'] ?? '';
        $productos = implode(', ', array_column($r['carrito']['productos'] ?? [], 'nombre'));
        $total     = number_format($r['carrito']['total'] ?? 0, 0, ',', '.');
        $direccion = $r['direccion'] ?? null;

        // Mapeo de estados internos a los estados que espera el nuevo prompt de respuesta
        $estadoPrompt = 'armando_pedido';
        if ($estado === 'confirmado') {
            $estadoPrompt = 'finalizado';
        } elseif ($estado === 'seleccionando' && empty($direccion)) {
            $estadoPrompt = 'armando_pedido';
        } elseif ($estado === 'carrito_vacio_confirmar') {
            $estadoPrompt = 'armando_pedido'; // O manejar como saludo/error
        }

        // Si hay productos pero no hay dirección y se intentó confirmar o es un pedido a domicilio
        if (($r['tipo_pedido'] ?? '') === 'domicilio' && empty($direccion) && !empty($productos)) {
            $estadoPrompt = 'esperando_direccion';
        }

        // Casos especiales fuera del flujo estándar
        if ($estado === 'cancelado') {
            $estadoPrompt = 'finalizado'; // Se puede mapear a finalizado para despedida
        }

        return "Genera la respuesta:\nproductos: [{$productos}]\ntotal: \${$total}\nestado: {$estadoPrompt}\ndireccion: " . ($direccion ?? 'null');
    }

    protected function llamarOpenAI(array $messages, float $temperature = 0.2): ?array
    {
        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post($this->apiUrl, [
                    'model'           => $this->model,
                    'messages'        => $messages,
                    'temperature'     => $temperature,
                    'response_format' => ['type' => 'json_object'],
                ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content');
                return $content ? json_decode($content, true) : null;
            }

            Log::error('Error OpenAI API (JSON):', ['status' => $response->status(), 'body' => $response->json()]);
        } catch (\Exception $e) {
            Log::error('Excepción OpenAI (JSON): ' . $e->getMessage());
        }

        return null;
    }

    protected function llamarOpenAITexto(array $messages, float $temperature = 0.7): ?string
    {
        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post($this->apiUrl, [
                    'model'       => $this->model,
                    'messages'    => $messages,
                    'temperature' => $temperature,
                ]);

            if ($response->successful()) {
                return $response->json('choices.0.message.content');
            }

            Log::error('Error OpenAI API (texto):', ['status' => $response->status(), 'body' => $response->json()]);
        } catch (\Exception $e) {
            Log::error('Excepción OpenAI (texto): ' . $e->getMessage());
        }

        return null;
    }

    protected function validarInterpretacion(?array $data): array
    {
        $default = [
            'intent'      => 'otro',
            'accion'      => 'ninguno',
            'productos'   => [],
            'direccion'   => null,
            'tipo_pedido' => 'local',
            'cantidad'    => 1,
        ];

        if (!$data || !is_array($data)) {
            return $default;
        }

        // Mapeo de "producto" (string) a "productos" (array) para el backend
        $listaProductos = [];
        if (!empty($data['producto'])) {
            $listaProductos = [$data['producto']];
        }

        $intent = $data['intent'] ?? 'otro';
        $direccion = $data['direccion'] ?? null;

        return [
            'intent'      => $intent,
            'accion'      => $data['accion'] ?? 'ninguno',
            'productos'   => $listaProductos,
            'direccion'   => $direccion ? strip_tags((string)$direccion) : null,
            'tipo_pedido' => ($intent === 'direccion' || $direccion) ? 'domicilio' : 'local',
            'cantidad'    => 1, // La IA ya no extrae cantidad explícitamente en el nuevo prompt
        ];
    }
}
