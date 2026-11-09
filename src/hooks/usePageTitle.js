import { useEffect } from "react";

const APP_NAME = "PNFI";

/**
 * Hook que actualiza document.title con el formato: "Título | PNFI"
 * @param {string} title - El título de la página/módulo actual
 */
export function usePageTitle(title) {
    useEffect(() => {
        document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
    }, [title]);
}
