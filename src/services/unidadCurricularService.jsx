import Api from "./api";

export const getAllUnidadesCurriculares = async () => {
    const response = await Api.get('/unidad_curricular');
    return response.data;
}

export const getUnidadCurricularById = async (id) => {
    const response = await Api.get(`/unidad_curricular/${id}`);
    return response.data;
}

export const getUnidadesCurricularesByPnf = async (pnfId) => {
    // Guardia: no hacer la petición si pnfId no es un entero válido
    const parsedId = parseInt(pnfId, 10);
    if (!pnfId || pnfId === "null" || isNaN(parsedId) || parsedId <= 0) {
        return [];
    }
    const response = await Api.get(`/pnf/${parsedId}/unidades_curriculares`);
    return response.data;
}

export const createUnidadCurricular = async (data) => {
    const response = await Api.post('/unidad_curricular', data);
    return response.data;
}

export const updateUnidadCurricular = async (id, data) => {
    const response = await Api.put(`/unidad_curricular/${id}`, data);
    return response.data;
}

export const deleteUnidadCurricular = async (id) => {
    const response = await Api.delete(`/unidad_curricular/${id}`);
    return response.data;
}

export const getTrimestres = async () => {
    const response = await Api.get('/get_trimestres');
    return response.data;
}

export const getTrimestresByTrayecto = async (trayectoId) => {
    const response = await Api.get(`/unidad_curricular/trimestres/${trayectoId}`);
    return response.data;
}

/**
 * Descarga el reporte PDF del catálogo de unidades curriculares.
 * @param {Object} params - Parámetros de filtro (periodo, pnf_id).
 * @returns {Blob} Archivo binario PDF.
 */
export const exportarUnidadesCurricularesPdf = async (params = {}) => {
    const response = await Api.get('/unidad_curricular/pdf', {
        params,
        responseType: 'blob',
    });
    return response.data;
}