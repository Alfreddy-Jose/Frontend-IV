import Api from "./api";

export const getHistorialActividades = async () => {
    try {
        const response = await Api.get("/historial_actividades");
        return response;
    } catch (error) {
        console.error("Error al obtener el historial de actividades:", error);
    }
};

