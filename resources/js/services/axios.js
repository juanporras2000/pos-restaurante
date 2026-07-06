import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status } = error.response;
            const rutaActual = window.location.pathname;

            if ((status === 401 || status === 403) && rutaActual !== "/perfiles") {
                localStorage.removeItem("perfil_activo");
                window.location.href = "/perfiles";
            }
        }
        return Promise.reject(error);
    }
);

window.axios = axios;

export default axios;
