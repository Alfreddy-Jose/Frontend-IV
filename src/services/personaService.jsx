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

export const getSeccionesByPnf = async (pnfId = null, lapsoId = null) => {
  // Filtra por PNF y/o lapso académico cuando se reciben. Si no se envía
  // ninguno, se mantiene el comportamiento previo (todas las secciones).
  const params = {};
  if (pnfId) params.pnf_id = pnfId;
  if (lapsoId) params.lapso_id = lapsoId;
  const response = await Api.get('/persona/get_secciones', { params });
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


