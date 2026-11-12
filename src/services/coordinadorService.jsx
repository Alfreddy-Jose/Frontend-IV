import Api from "./api";

export const getAllCoordinadores = async () => {
  const response = await Api.get('/coordinadores');
  return response.data;
}

export const createCoordinador = async (coordinadorData) => {
  const response = await Api.post('/coordinador', coordinadorData);
  return response.data;
}

export const deleteCoordinador = async (coordinadorId) => {
  const response = await Api.delete(`/coordinador/${coordinadorId}`);
  return response.data;
}

export const getDocentes = async (boolean) => {
  const response = await Api.get(`/coordinador/getDocentes/${boolean}`);
  return response.data;
}

/**
 * Descarga el reporte PDF del catálogo de coordinadores.
 * @param {Object} params - Parámetros de filtro (activo).
 * @returns {Blob} Archivo binario PDF.
 */
export const exportarCoordinadoresPdf = async (params = {}) => {
  const response = await Api.get('/coordinadores/pdf', {
    params,
    responseType: 'blob',
  });
  return response.data;
}