import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const isProduction = window.location.protocol === 'https:';

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: isProduction ? 443 : (import.meta.env.VITE_REVERB_PORT ?? 8080),
    wssPort: isProduction ? 443 : (import.meta.env.VITE_REVERB_PORT ?? 8080),
    forceTLS: isProduction,
    enabledTransports: ['ws', 'wss'],
});
