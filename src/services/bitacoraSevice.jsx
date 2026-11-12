import api from './api'; // Importa tu instancia configurada de Axios (con baseURL e interceptores)

/**
 * Servicio para gestionar las peticiones de la Bitácora de Auditoría.
 */
export const bitacoraService = {
  /**
   * Obtiene el listado paginado y filtrado de la bitácora.
   * 
   * @param {Object} params - Parámetros de búsqueda y paginación.
   * @param {number} [params.page=1] - Número de página.
   * @param {string} [params.search=''] - Filtro de búsqueda (usuario, módulo, etc.).
   * @param {string} [params.accion=''] - Filtro por tipo de acción (INSERTAR, MODIFICAR, ELIMINAR, INICIO_SESION, CIERRE_SESION, INTENTO_FALLIDO).
   * @returns {Promise<Object>} Datos paginados de la bitácora.
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/bitacora', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener la bitácora:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Obtiene los detalles de un registro específico de la bitácora si es necesario.
   * 
   * @param {number|string} id - ID del registro de la bitácora.
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/bitacora/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el detalle de bitácora ${id}:`, error);
      throw error.response?.data || error;
    }
  }
};