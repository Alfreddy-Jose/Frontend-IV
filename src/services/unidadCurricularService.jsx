import Api from "./api";

export const getAllUnidadesCurriculares = async () => {
    const response = await Api.get('/unidad_curricular');
    return response.data;
}

export const getUnidadCurricularById = async (id) => {
    const response = await Api.get(`/unidad_curricular/${id}`);
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