import api from './api'; // Tu instancia de Axios configurada con la baseURL y Tokens

export const getDashboardData = async (lapsoId = null) => {
  try {
    const params = lapsoId ? { lapso_id: lapsoId } : {};
    const response = await api.get('/dashboard', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener los datos del dashboard:', error);
    throw error;
  }
};