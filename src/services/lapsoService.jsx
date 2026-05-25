import api from './api';

export const getAllLapsos = async () => {
  const response = await api.get('/lapsos');
  return response.data;
}
export const getActivosLapsos = async () => {
  const response = await api.get('/lapsos/activos');
  return response.data;
}

export const createLapso = async (lapsoData) => {
  const response = await api.post('/lapso', lapsoData);
  return response.data;
}

export const getLapsoById = async (id) => {
  const response = await api.get(`/lapso/${id}`);
  return response.data;
}

export const updateLapso = async (id, lapsoData) => {
  const response = await api.put(`/lapso/${id}`, lapsoData);
  return response.data;
}

export const deleteLapso = async (id) => {
  const response = await api.delete(`/lapso/${id}`);
  return response.data;
}

export const getTipoLapso = async () => {
  const response = await api.get('/get_tipoLapsos');
  return response.data;
}
