import Api from "./api";

export const getAllCensos = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/censos?${queryString}` : "/censos";
  const response = await Api.get(url);
  return response.data;
};

export const createCenso = async (censoData) => {
  const response = await Api.post("/censo", censoData);
  return response.data;
};

export const deleteCenso = async (id) => {
  const response = await Api.delete(`/censo/${id}`);
  return response.data;
};

export const getCensoById = async (id) => {
  const response = await Api.get(`/censo/${id}`); 
  return response.data;
};

export const getEstudiantes = async (params = {}) => {
  const response = await Api.get('/censos/getEstudiantes', { params });
  return response.data;
};


export const updateCenso = async (id, censoData) => {
  const response = await Api.put(`/censo/${id}`, censoData);
  return response.data;
};


// =========================================================================
// ENDPOINTS OPTIMIZADOS PARA REPORTES Y AUTOMATIZACIÓN (REGLAS DEL COORDINADOR)
// =========================================================================

/**
 * Genera un archivo Excel con los datos del censo.
 * @returns {Blob} Archivo Excel con la información censal.
 */
export const exportarCensosExcel = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/censos/exportar-excel?${queryString}` : "/censos/exportar-excel";
  
  const response = await Api.get(url, {
    responseType: 'blob' // Es vital para descargar archivos
  });
  return response.data;
};

