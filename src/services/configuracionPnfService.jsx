import Api from "./api";

export const DEFAULT_CONFIG_TRAYECTO = {
  max_estudiantes_seccion: 30,
  tasa_aprobacion_base: 50.0,
  tasa_reprobacion_base: 50.0,
};

/**
 * Obtiene todas las configuraciones de un PNF (una por trayecto).
 * GET /api/configuracion_pnf/:pnfId
 * Retorna un array de objetos con la config de cada trayecto.
 */
export const getConfiguracionesPnf = async (pnfId) => {
  const response = await Api.get(`/configuracion_pnf/${pnfId}`);
  // El backend devuelve { data: [...] } o { trayectos: [...] }; extraemos el array directamente.
  const body = response.data;
  return Array.isArray(body)
    ? body
    : (Array.isArray(body?.trayectos)
        ? body.trayectos
        : (Array.isArray(body?.data) ? body.data : []));
};

/**
 * Guarda (POST) la configuración de un trayecto específico.
 * POST /api/configuracion_pnf
 */
export const saveConfiguracionTrayecto = async (payload) => {
  const response = await Api.post("/configuracion_pnf", payload);
  return response.data;
};
