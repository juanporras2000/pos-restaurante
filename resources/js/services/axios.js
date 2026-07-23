import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            const { status } = error.response;
            const rutaActual = window.location.pathname;

            if (status === 401 || status === 419) {
                localStorage.removeItem("perfil_activo");

                // Notificamos al usuario antes de sacarlo
                await Swal.fire({
                    icon: 'warning',
                    title: 'Sesión expirada',
                    text: 'Tu sesión ha terminado por inactividad. Por favor, inicia sesión nuevamente.',
                    confirmButtonText: 'Ir al Login',
                    confirmButtonColor: '#2563eb',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                });

                window.location.href = "/login";

                // Retornamos una promesa pendiente para congelar el flujo en el componente
                return new Promise(() => {});
            }

            // 2. Manejo de Permisos / Perfil no autorizado (Tu lógica original mejorada)
            if (status === 403 && rutaActual !== "/perfiles") {
                localStorage.removeItem("perfil_activo");
                window.location.href = "/perfiles";
                return new Promise(() => {});
            }
        }

        return Promise.reject(error);
    }
);

window.axios = axios;

export default axios;
