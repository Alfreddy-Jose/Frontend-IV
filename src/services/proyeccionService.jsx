import Api from "./api";

/**
 * Obtiene los lapsos académicos con estatus 'Planificación'.
 */
export const getLapsosPlanificacion = async () => {
  const response = await Api.get("/lapsos/planificacion");
  return response.data;
};

/**
 * Obtiene los datos base de inscripción por PNF, Sede y Lapso.
 */
export const getDatosBaseProyeccion = async (pnfId, sedeId, lapsoId) => {
  const response = await Api.get(`/proyeccion/datos_base/${pnfId}`, {
    params: { sede_id: sedeId, lapso_id: lapsoId },
  });
  return response.data;
};

/**
 * Obtiene las sedes por PNF.
 */
export const getSedesByPnf = async (pnfId) => {
  const response = await Api.get(`/proyecciones/pnf/${pnfId}/sedes`);
  return response.data;
};
/**
 * Guarda las proyecciones calculadas.
 */
export const saveProyecciones = async (payload) => {
  const response = await Api.post("/proyeccion/guardar_proyecciones", payload);
  return response.data;
};

/**
 * Obtiene la factibilidad docente por trayecto.
 */
export const getFactibilidadDocente = async (trayectoId) => {
  const response = await Api.get(`/proyeccion/factibilidad_docente/${trayectoId}`);
  return response.data;
};

/**
 * Guarda la configuración de capacidades (max_estudiantes_seccion) por sede y trayecto.
 */
export const saveConfiguracionCapacidades = async (payload) => {
  const response = await Api.post("/configuracion_pnf", payload);
  return response.data;
};

// ---------------------------------------------------------------------------
// Nuevos Endpoints para el Wizard de Proyecciones
// ---------------------------------------------------------------------------

/**
 * Prepara el Paso 1 de la proyección.
 */
export const prepararPaso1 = async (payload) => {
  const response = await Api.post("/proyeccion/paso1", payload);
  return response.data;
};

/**
 * Guarda el Paso 1 de la proyección.
 */
export const guardarPaso1 = async (payload) => {
  const response = await Api.post("/proyeccion/guardar_paso1", payload);
  return response.data;
};

/**
 * Obtiene los datos iniciales para los selectores (años académicos, is_admin, PNF).
 */
export const obtenerDatosIniciales = async () => {
  const response = await Api.get("/proyeccion/datos_selects");
  return response.data;
};

/**
 * Obtiene los datos del Paso 2 de la proyección académica.
 * GET /api/proyeccion/:proyeccionId/paso2
 */
export const obtenerDatosPaso2 = async (proyeccionId) => {
  const response = await Api.get(`/proyeccion/${proyeccionId}/paso2`);
  return response.data;
};

/**
 * Guarda las decisiones tomadas en el Paso 2 de la proyección académica.
 */
export const guardarPaso2 = async (payload) => {
  const response = await Api.post("/proyeccion/guardar_paso2", payload);
  return response.data;
};

export const finalizarProyeccion = async (payload) => {
  const response = await Api.post("/proyecciones/finalizar", payload);
  return response.data;
};

/**
 * Exporta el reporte de proyección de secciones en formato Excel.
 * @param {Array} detalles - Array con los detalles de secciones proyectadas.
 * @returns {Promise} - Respuesta con blob del archivo Excel.
 */
export const exportarProyeccionExcel = async (detalles, ano_proyectado, ano_origen_historico, proyeccion_id = null) => {
  const response = await Api.post(
    "/exportar_proyeccion",
    { detalles, ano_proyectado, ano_origen_historico, proyeccion_id },
    { responseType: "blob" }
  );
  return response;
};


