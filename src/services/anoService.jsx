import Api from "./api";

/**
 * Obtiene el cronograma completo de años académicos con sus lapsos (Para el Panel)
 */
export const getAllAnos = async () => {
  const response = await Api.get('/panel/cronograma');
  return response.data;
};

/**
 * Registra un nuevo Año Académico en el sistema
 */
export const createAnoAcademico = async (anoData) => {
  const response = await Api.post('/panel/ano', anoData);
  return response.data;
};

/**
 * Obtiene los detalles de un Año Académico específico por su ID
 */
export const getAnoById = async (anoId) => {
  const response = await Api.get(`/panel/ano/${anoId}`);
  return response.data;
};

/**
 * Actualiza las fechas de un Año Académico existente
 */
export const updateAnoAcademico = async (anoId, anoData) => {
  const response = await Api.put(`/panel/ano/${anoId}`, anoData);
  return response.data;
};

/**
 * Elimina de forma física o lógica un Año Académico del sistema
 */
export const deleteAno = async (anoId) => {
  const response = await Api.delete(`/panel/ano/${anoId}`);
  return response.data;
};

/**
 * ACCIÓN MANUAL: Fuerza el inicio anticipado de un año en planificación
 */
export const forzarInicioAno = async (anoId) => {
  const response = await Api.post(`/panel/ano/${anoId}/forzar-inicio`);
  return response.data;
};

/**
 * ACCIÓN MANUAL: Clausura anticipadamente un año académico activo
 */
export const forzarCierreAno = async (anoId) => {
  const response = await Api.post(`/panel/ano/${anoId}/forzar-cierre`);
  return response.data;
};