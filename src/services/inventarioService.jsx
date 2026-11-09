import Api from "./api";

/**
 * Obtiene el inventario/reporte de bienes filtrado por lapso académico y filtros opcionales.
 */
export const getInventarioByLapso = async (lapsoId, params = {}) => {
    const response = await Api.get(`/inventario/lapso/${lapsoId}`, { params });
    return response.data;
};

/**
 * Obtiene el listado completo de bienes aceptando el lapsoId
 */
export const getAllBienes = async (lapsoId, params = {}) => {
    const response = await Api.get('/bienes', {
        params: params, // Parámetros query opcionales (búsquedas, paginación, etc.)
    });
    return response.data;
};

/**
 * Registra un nuevo bien en la ficha general de activos de la coordinación.
 */
export const createBien = async (bienData) => {
    // Si viene una imagen o es un objeto simple, creamos FormData
    const formData = new FormData();

    Object.keys(bienData).forEach((key) => {
        if (bienData[key] !== null && bienData[key] !== undefined) {
            formData.append(key, bienData[key]);
        }
    });

    const response = await Api.post('/bienes', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Obtiene los detalles de un bien específico por ID.
 */
export const getBienById = async (bienId) => {
    const response = await Api.get(`/bienes/${bienId}`);
    return response.data;
};

/**
 * Actualiza la ficha estática de un bien.
 */
export const updateBien = async (bienId, bienData) => {
    const response = await Api.put(`/bienes/${bienId}`, bienData);
    return response.data;
};

/**
 * Elimina un bien del sistema.
 */
export const deleteBien = async (bienId) => {
    const response = await Api.delete(`/bienes/${bienId}`);
    return response.data;
};

/**
 * Registra o actualiza el estatus dinámico de un bien en el lapso actual.
 */
export const guardarReporteEstatus = async (reporteData) => {
    // Si reporteData es FormData, Axios establecerá automáticamente
    // los headers con el 'boundary' necesario para multipart/form-data.
    const response = await Api.post('/inventario/reporte', reporteData, {
        headers: reporteData instanceof FormData ? {
            'Content-Type': 'multipart/form-data',
        } : {},
    });
    return response.data;
};

/**
 * Realiza la carga/actualización masiva del estado de los bienes en un lapso.
 */
export const guardarReporteMasivo = async (reporteMasivoData) => {
    const response = await Api.post('/inventario/reporte-masivo', reporteMasivoData);
    return response.data;
};

/**
 * Exporta el reporte de inventario a Excel con el resguardo legal por lapso.
 */
export const exportarInventarioPdf = async (params) => {
    const response = await Api.get('/inventario/pdf', {
        params,
        responseType: 'blob',
    }); 
    return response.data;
};