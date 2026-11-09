import axios from "axios";
import { notify } from "@/components/shared/Notify";

// Configuración básica de Axios
export const Api = axios.create({
  baseURL: `/api`,
  timeout: 5000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true, // Vital para enviar y recibir la cookie HttpOnly
  withXSRFToken: true,   // Envía automáticamente el token CSRF
  xsrfCookieName: 'XSRF-TOKEN',   // <--- Obligatorio para que Axios lea la cookie CSRF
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Interceptor de peticiones
Api.interceptors.request.use(
  (config) => {
    // 1. Si estamos en la página de login, limpiamos la bandera
    if (window.location.pathname === "/login") {
      window.__sessionExpired = false;
    }

    // 2. Si la sesión ya expiró, bloqueamos peticiones subsiguientes
    if (window.__sessionExpired) {
      return Promise.reject(new Error("Sesión expirada"));
    }

    // Lapso académico activo (este dato no es un secreto de seguridad, se puede mantener)
    const lapsoRaw = localStorage.getItem("lapsoActual");
    if (lapsoRaw) {
      try {
        const lapso = JSON.parse(lapsoRaw);
        if (lapso && lapso.id) {
          config.headers["X-Lapso-Id"] = lapso.id;
        }
      } catch {
        // JSON inválido: no se inyecta el header
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar respuestas no autorizadas o expiradas
Api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (window.__sessionExpired) {
      return Promise.reject(error);
    }

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 419)
    ) {
      if (window.location.pathname !== "/login") {
        window.__sessionExpired = true;

        // Limpiamos datos de UI (el token ya no existe aquí)
        localStorage.removeItem("user");
        localStorage.removeItem("permissions");
        localStorage.removeItem("lapsoActual");

        notify.error("Tu sesión ha expirado por seguridad. Por favor, inicia sesión nuevamente.");

        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      }
    }
    return Promise.reject(error);
  },
);

export default Api;