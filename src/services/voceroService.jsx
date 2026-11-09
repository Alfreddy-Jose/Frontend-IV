import Api from "./api";

/**
 * Obtiene la lista de voceros filtrada por los parámetros enviados (ej: lapso_id, seccion_id, tipo_vocero).
 */
export const getAllVoceros = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/voceros?${queryString}` : "/voceros";
  const response = await Api.get(url);
  return response.data;
};

/**
 * Registra/Designa un nuevo vocero.
 */
export const createVocero = async (voceroData) => {
  const response = await Api.post("/vocero", voceroData);
  return response.data;
};

/**
 * Elimina/Remueve la designación de un vocero por su ID.
 */
export const deleteVocero = async (id) => {
  const response = await Api.delete(`/vocero/${id}`);
  return response.data;
};

/**
 * Obtiene los detalles de un vocero por su ID.
 */
export const getVoceroById = async (id) => {
  const response = await Api.get(`/vocero/${id}`);
  return response.data;
};

/**
 * Actualiza la información o tipo de vocería de un vocero existente.
 */
export const updateVocero = async (id, voceroData) => {
  const response = await Api.put(`/vocero/${id}`, voceroData);
  return response.data;
};

// =========================================================================
// ENDPOINTS OPTIMIZADOS PARA REPORTES Y EXPORTACIÓN
// =========================================================================

/**
 * Genera y descarga un archivo Excel con los datos de voceros filtrados.
 * @param {Object} params - Parámetros de filtro (lapso_id, seccion_id, tipo_vocero).
 * @returns {Blob} Archivo binario Excel.
 */
export const exportarVocerosExcel = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString
    ? `/voceros/exportar-excel?${queryString}`
    : "/voceros/exportar-excel";

  const response = await Api.get(url, {
    responseType: "blob", // Requerido para recibir el binario del Excel
  });
  return response.data;
};