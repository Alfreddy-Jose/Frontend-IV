import Api from "./api";

export const getAllPers = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/per?${queryString}` : "/per";
    const response = await Api.get(url);
    return response.data;
};

export const getPerById = async (id) => {
    const response = await Api.get(`/per/${id}`);
    return response.data;
};

export const createPer = async (data) => {
    const response = await Api.post("/per", data);
    return response.data;
};

export const updatePer = async (id, data) => {
    const response = await Api.put(`/per/${id}`, data);
    return response.data;
};

export const deletePer = async (id) => {
    const response = await Api.delete(`/per/${id}`);
    return response.data;
};

export const getDocentes = async () => {
    const response = await Api.get(`/per/getDocentes`);
    return response.data;
}

export const getUnidadesCurricularesPorDocente = async (docenteId) => {
    const response = await Api.get(`/per/getUnidadesCurricularesPorDocente/${docenteId}`);
    // DEBUG: log de la respuesta cruda para verificar la estructura
    console.log('[perService] raw response.data:', response.data);

    // Maneja múltiples estructuras posibles del backend:
    // Caso 1: { unidadesCurriculares: [...] }  (estructura directa)
    // Caso 2: { data: { unidadesCurriculares: [...] } } (con capa extra de Laravel Resource)
    // Caso 3: el arreglo directo [...]
    const payload = response.data?.data ?? response.data;
    if (Array.isArray(payload)) return payload;
    return payload?.unidadesCurriculares ?? [];
};

export const exportarPersExcel = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/pers/exportar-excel?${queryString}` : "/pers/exportar-excel";

    const response = await Api.get(url, {
        responseType: "blob", // Es vital para descargar archivos
    });
    return response.data;
};

export const exportarPersPdf = async (params) => {
  const response = await Api.get('/per/pdf', {
    params,
    responseType: 'blob',
  });
  return response.data;
};
