import Api from "./api";

export const getAllSecciones = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/secciones?${queryString}` : "/secciones";
  const response = await Api.get(url);
  return response.data;
};

export const createSeccion = async (seccionData) => {
  const response = await Api.post("/seccion", seccionData);
  return response.data;
};

export const deleteSeccion = async (id) => {
  const response = await Api.delete(`/seccion/${id}`);
  return response.data;
};

export const updateSeccion = async (id, seccionData) => {
  const response = await Api.put(`/seccion/${id}`, seccionData);
  return response.data;
};

export const getSeccionById = async (id) => {
  const response = await Api.get(`/seccion/${id}`);
  return response.data;
};

export const getDataSelectSeccion = async () => {
  const response = await Api.get(`/seccion/getDataSelect`);
  return response.data;
};

export const getPnfBySede = async (sedeId) => {
  const response = await Api.get(`/secciones/pnfs/sede/${sedeId}`);
  return response.data;
}

export const generarReporteSecciones = async (params = {}) => {
  try {
    const response = await Api.get(`/secciones/pdf`, {
      params,
      responseType: 'blob' // importante: decirle a axios que espere un archivo binario
    });

    // Crear un objeto URL para el blob recibido
    const url = window.URL.createObjectURL(new Blob([response.data]));

    // Crear un elemento <a> para forzar la descarga
    const link = document.createElement('a');
    link.href = url;

    // Agregar la extensión .pdf al nombre del archivo
    link.setAttribute('download', 'secciones_reporte.pdf');

    // Simular clic en el enlace para iniciar la descarga
    document.body.appendChild(link);
    link.click();

    // Limpiar después de un breve retraso
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // liberar la URL del blob
    }, 100);

    return { success: true };
  } catch (error) {
    console.error('Error al generar reporte de secciones:', error);
    throw error;
  }
};

