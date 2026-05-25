import Api from "./api";

export const getAllDocentes = async () => {
  const response = await Api.get('/docentes');
  return response.data;
}

export const createDocente = async (docenteData) => {
  const response = await Api.post('/docente', docenteData);
  return response.data;
}

export const deleteDocente = async (docenteId) => {
  const response = await Api.delete(`/docente/${docenteId}`);
  return response.data;
}

export const updateDocente = async (docenteId, docenteData) => {
  const response = await Api.put(`/docente/${docenteId}`, docenteData);
  return response.data;
}

export const getDocenteById = async (docenteId) => {
  const response = await Api.get(`/docente/${docenteId}`);
  return response.data;
}

export const getDataSelect = async () => {
  const response = await Api.get(`/docente/getDataSelect`);
  return response.data;
}