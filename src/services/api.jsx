import axios from "axios";

// Configuración basica de Axios
export const Api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`, // Dirección de la Api
  timeout: 5000, // tiempo máximo de espera
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    // Aquí se pueden agregar más headers como token de autenticación
  },
  withCredentials: true, // Necesario para las cookies de Sanctum
  withXSRFToken: true,
});

// configuracion para enviar token
Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // O donde guardes tu token
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar respuestas no autorizadas
Api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 419)
    ) {
      if (window.location.pathname !== "/login") {
        // Limpia el almacenamiento
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("permissions");

        // Redirige al login solo si venías de otra página protegida
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default Api;
