/**
 * Catálogo central de acciones de la bitácora y su presentación visual.
 * Se reutiliza en la tabla, en el modal de detalles y en las métricas.
 */

export const ACCIONES_SESION = [
    "INICIO_SESION",
    "CIERRE_SESION",
    "INTENTO_FALLIDO",
];

/**
 * Indica si la acción corresponde a un evento de sesión (login/logout).
 */
export const esAccionSesion = (accion) =>
    ACCIONES_SESION.includes(String(accion || "").toUpperCase());

/**
 * Clases de Tailwind para el badge de cada acción.
 */
export const clasesBadgeAccion = (accion) => {
    switch (String(accion || "").toUpperCase()) {
        case "INSERTAR":
            return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
        case "MODIFICAR":
            return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
        case "ELIMINAR":
            return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800";
        case "INICIO_SESION":
            return "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800";
        case "CIERRE_SESION":
            return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
        case "INTENTO_FALLIDO":
            return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
        default:
            return "";
    }
};

/**
 * Etiqueta legible para cada acción.
 */
export const etiquetaAccion = (accion) => {
    const etiquetas = {
        INSERTAR: "Insertar",
        MODIFICAR: "Modificar",
        ELIMINAR: "Eliminar",
        INICIO_SESION: "Inicio de sesión",
        CIERRE_SESION: "Cierre de sesión",
        INTENTO_FALLIDO: "Intento fallido",
    };

    return etiquetas[String(accion || "").toUpperCase()] || accion || "N/A";
};
