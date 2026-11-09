import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const APP_NAME = "PNFI";

/**
 * Mapa de rutas a títulos de página.
 * El wizard de Proyecciones se maneja internamente en Proyecciones.jsx
 * porque sus títulos dependen del paso activo (no de la URL).
 */
const ROUTE_TITLES = {
    "/": "Dashboard",
    "/users": "Usuarios",
    "/profile": "Mi Perfil",
    "/pnfs": "PNF",
    "/configuraciones_pnf": "Configuración PNF",
    "/proyecciones": "Proyecciones Académicas",
    "/sedes": "Sedes",
    "/lapsos": "Lapsos",
    "/anos_academicos": "Años Académicos",
    "/matriculas": "Matrículas",
    "/inventario": "Inventario",
    "/bitacora": "Bitácora de Auditoría",
    "/roles_permisos": "Roles y Permisos",
    "/trayectos": "Trayectos",
    "/personas": "Personas",
    "/docentes": "Docentes",
    "/coordinadores": "Coordinadores",
    "/voceros": "Voceros",
    "/secciones": "Secciones",
    "/unidad_curricular": "Unidades Curriculares",
    "/gestion_entregas": "Gestión de Entregas",
    "/censo_estudiantil": "Censo Estudiantil",
    "/estadistica_inscripcion": "Estadística de Inscripción",
    "/per": "PER",
    "/login": "Iniciar Sesión",
    "/unauthorized": "No Autorizado",
};

/**
 * TitleManager — componente sin UI que actualiza document.title
 * al navegar entre rutas. Debe montarse dentro de <Router> en App.jsx.
 */
export default function TitleManager() {
    const { pathname } = useLocation();

    useEffect(() => {
        const pageTitle = ROUTE_TITLES[pathname];
        if (pageTitle) {
            document.title = `${pageTitle} | ${APP_NAME}`;
        } else {
            // Fallback para rutas no registradas (ej: 404)
            document.title = `Página no encontrada | ${APP_NAME}`;
        }
    }, [pathname]);

    return null;
}
