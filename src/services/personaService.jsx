import Api from "./api";

export const getAllPersonas = async () => {
  const response = await Api.get('/personas');
  return response.data;
}

export const createPersona = async (personaData) => {
  const response = await Api.post('/persona', personaData);
  return response.data;
}

export const getPersonaById = async (id) => {
  const response = await Api.get(`/persona/${id}`);
  return response.data;
}

export const deletePersona = async (personaId) => {
  const response = await Api.delete(`/persona/${personaId}`);
  return response.data;
}

export const updatePersona = async (personaId, personaData) => {
  const response = await Api.put(`/persona/${personaId}`, personaData);
  return response.data;
}

export const getSeccionesByPnf = async (pnfId = null) => {
  // Si viene un pnfId lo añade como query param, de lo contrario pide todas
  const url = pnfId ? `/persona/get_secciones?pnf_id=${pnfId}` : '/persona/get_secciones';
  const response = await Api.get(url);
  return response.data;
}

/**
 * Descarga el reporte PDF de personas respetando los filtros enviados.
 * @param {Object} params - Parámetros de filtro (tipo_persona, grado_inst, pnf).
 * @returns {Blob} Archivo binario PDF.
 */
export const exportarPersonasPdf = async (params = {}) => {
  const response = await Api.get('/personas/pdf', {
    params,
    responseType: 'blob',
  });
  return response.data;
}


