import api from "./api";

export const getAllSedes = async () => {
  const response = await api.get('/sedes');
  return response.data;
};

export const createSede = async (sedeData) => {
  const response = await api.post('/sede', sedeData);
  return response.data;
};

export const getEstados = async () => {
  const response = await api.get('/sede/getEstados');
  return response.data;
}

export const getMunicipios = async (estadoId) => {
  const response = await api.get(`/sede/getMunicipios/${estadoId}`);
  return response.data;
};

export const deleteSede = async (sedeId) => {
  const response = await api.delete(`/sede/${sedeId}`);
  return response.data;
}

export const updateSede = async (sedeId, sedeData) => {
  const response = await api.put(`/sede/${sedeId}`, sedeData);
  return response.data;
}

export const getSedeById = async (sedeId) => {
  const response = await api.get(`/sede/${sedeId}`);
  return response.data;
}

export const getUniversidades = async () => {
  const response = await api.get('/sede/getUniversidad');
  return response.data;
}

export const getPnfs = async () => {
  const response = await api.get('/sede/getPnf');
  return response.data;
}