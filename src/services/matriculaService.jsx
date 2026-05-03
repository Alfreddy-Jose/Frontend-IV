import Api from "./api";

export const getAllMatriculas = async () => {
  const response = await Api.get('/matriculas');
  return response.data;
}

export const createMatricula = async (matriculaData) => {
  const response = await Api.post('/matricula', matriculaData);
  return response.data;
}

export const deleteMatricula = async (matriculaId) => {
  const response = await Api.delete(`/matricula/${matriculaId}`);
  return response.data;
}

export const updateMatricula = async (matriculaId, matriculaData) => {
  const response = await Api.put(`/matricula/${matriculaId}`, matriculaData);
  return response.data;
}

export const getMatriculaById = async (matriculaId) => {
  const response = await Api.get(`/matricula/${matriculaId}`);
  return response.data;
}