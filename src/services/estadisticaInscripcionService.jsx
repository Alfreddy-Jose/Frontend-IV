import Api from "./api";

// Descargar plantilla oficial
export const descargarPlantilla = async () => {
  const response = await Api.get("/estadistica_inscripcion/descargar_plantilla", {
    responseType: "blob", // Crucial para manejar archivos binarios
  });
  return response.data;
};

// Carga masiva
export const importarEstadistica = async (formData) => {
  const response = await Api.post("/estadistica_inscripcion/importar", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
  return response.data;
};

// Dividir sección sobrecargada (> 45 estudiantes)
export const dividirSeccion = async (payload) => {
  const response = await Api.post("/estadistica_inscripcion/dividir", payload);
  return response.data;
};

// Retorna todas las secciones
export const indexSeccion = async (params = {}) => {
  const response = await Api.get("/estadistica_inscripcion", { params });
  return response.data;
};

// Fusionar sección con baja matrícula (< 15 estudiantes)
export const fusionarSecciones = async (payload) => {
  const response = await Api.post("/estadistica_inscripcion/fusionar", payload);
  return response.data;
};