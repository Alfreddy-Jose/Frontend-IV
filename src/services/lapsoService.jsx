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

export const getDataSelect = async () => {
  const response = await api.get('/getDataSelect');
  return response.data;
}

/**
 * ACCIÓN MANUAL: Fuerza el inicio anticipado de un lapso en planificación
 */
export const forzarInicioLapso = async (lapsoId) => {
  const response = await api.post(`/lapso/${lapsoId}/forzar-inicio`);
  return response.data;
};

/**
 * ACCIÓN MANUAL: Clausura anticipadamente un Lapso activo
 */
export const forzarCierreLapso = async (lapsoId) => {
  const response = await api.post(`/lapso/${lapsoId}/forzar-cierre`);
  return response.data;
};
