import Api from "./api";

export const getAllTrayectos = async () => {
  const response = await Api.get('/trayectos');
  return response.data;
}

export const createTrayecto = async (pnfData) => {
  const response = await Api.post('/trayecto', pnfData);
  return response.data;
}

export const deleteTrayecto = async (trayectoId) => {
  const response = await Api.delete(`/trayecto/${trayectoId}`);
  return response.data;
}

export const updateTrayecto = async (trayectoId, trayectoData) => {
  const response = await Api.put(`/trayecto/${trayectoId}`, trayectoData);
  return response.data;
}

export const getTrayectoById = async (trayectoId) => {
  const response = await Api.get(`/trayecto/${trayectoId}`);
  return response.data;
}

/**
 * Descarga el reporte PDF del catálogo de trayectos.
 * @param {Object} params - Parámetros de filtro.
 * @returns {Blob} Archivo binario PDF.
 */
export const exportarTrayectosPdf = async (params = {}) => {
  const response = await Api.get('/trayectos/pdf', {
    params,
    responseType: 'blob',
  });
  return response.data;
}