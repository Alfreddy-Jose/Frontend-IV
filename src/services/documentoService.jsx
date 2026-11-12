import Api from "./api";

/**
 * Servicio para gestionar los documentos asociados a un PNF.
 */

// Lista los documentos. El backend limita por el PNF del usuario si tiene uno.
export const getAllDocumentos = async (params = {}) => {
  const response = await Api.get("/documentos", { params });
  return response.data;
};

// Sube un documento (multipart/form-data: archivo y pnf_id).
export const subirDocumento = async (formData, onUploadProgress) => {
  const response = await Api.post("/documentos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
    onUploadProgress,
  });
  return response.data;
};

// Descarga el archivo original del documento.
export const descargarDocumento = async (id) => {
  const response = await Api.get(`/documentos/${id}/descargar`, {
    responseType: "blob",
    timeout: 60000,
  });
  return response.data;
};

// Elimina el documento y su archivo del servidor.
export const eliminarDocumento = async (id) => {
  const response = await Api.delete(`/documentos/${id}`);
  return response.data;
};

// Obtiene el detalle de un documento.
export const getDocumentoById = async (id) => {
  const response = await Api.get(`/documentos/${id}`);
  return response.data;
};
