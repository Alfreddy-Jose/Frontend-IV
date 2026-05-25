import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const token = localStorage.getItem("token");

const echo = new Echo({
    broadcaster: 'reverb',
    // Lee la key desde las variables de entorno de Vite
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    
    // Ruta de autenticación de canales privados en Laravel Sanctum
    authEndpoint: `${import.meta.env.VITE_API_BASE_URL}/broadcasting/auth`,
    
    // Reutilizamos exactamente la lógica de cabeceras de tu archivo api.jsx
    auth: {
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
            Accept: 'application/json',
        },
    },
});

export default echo;