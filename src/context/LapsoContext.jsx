/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { getLapsos } from "@/services/lapsoService";
import { useAuth } from "@/context/AuthContext";

const LapsoContext = createContext();

/**
 * Únicamente la pantalla de login carece de sesión.
 * Antes se reutilizaba el criterio de AuthContext (que también excluye "/"),
 * pero "/" es el Dashboard y allí SÍ debe cargarse el listado de lapsos.
 */
const isLoginPage = () => window.location.pathname === "/login";

/**
 * El backend responde el listado completo de lapsos como { success, data: [] }
 * mientras que otros endpoints devuelven el arreglo plano. Normalizamos ambos.
 */
const normalizarLista = (respuesta) => {
  if (Array.isArray(respuesta)) return respuesta;
  return respuesta?.data ?? [];
};

/**
 * El backend expone el estado del lapso en el campo `estado`
 * (planificacion, cronograma, activo, cerrado). Se tolera también `estatus`
 * por si el contrato cambia.
 */
const estadoDe = (lapso) => lapso?.estado ?? lapso?.estatus;
const esCerrado = (lapso) => estadoDe(lapso) === "cerrado";
const esActivo = (lapso) => estadoDe(lapso) === "activo";

/**
 * Solo los lapsos activos y cerrados se muestran al usuario. Los que están en
 * planificación o cronograma (futuros) se ocultan del selector global.
 */
const esVisible = (lapso) => esActivo(lapso) || esCerrado(lapso);

/**
 * Provee el lapso académico seleccionado a toda la aplicación, incluyendo
 * los lapsos cerrados (histórico) para poder consultarlos en modo solo lectura.
 */
export function LapsoProvider({ children }) {
  // Puente con AuthContext: mantenemos `lapsoActual` sincronizado para que el
  // interceptor de api.jsx siga enviando el header X-Lapso-Id correcto.
  const { setLapsoActual, user } = useAuth();

  const [lapsos, setLapsos] = useState([]);
  const [selectedLapso, setSelectedLapso] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLapsos = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const respuesta = await getLapsos();
      const lista = normalizarLista(respuesta);
      setLapsos(lista);

      setSelectedLapso((prev) => {
        if (lista.length === 0) return null;

        // 1. Conservamos la selección vigente si el lapso sigue visible.
        const actual = lista.find(
          (l) => String(l.id) === String(prev?.id) && esVisible(l),
        );
        if (actual) return actual;

        // 2. Respetamos la selección guardada entre recargas (solo si es
        //    visible, para no reabrir el histórico sin intención del usuario).
        let guardado = null;
        try {
          guardado = JSON.parse(localStorage.getItem("lapsoActual"));
        } catch {
          guardado = null;
        }
        const guardadoEnLista = lista.find(
          (l) => String(l.id) === String(guardado?.id) && esVisible(l),
        );
        if (guardadoEnLista) return guardadoEnLista;

        // 3. Por defecto el primer lapso activo; si no hay, el primer cerrado.
        return lista.find(esActivo) ?? lista.find(esCerrado) ?? lista[0];
      });
    } catch (error) {
      console.error("Error al obtener los lapsos académicos:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Solo se omite la consulta sin sesión: en el login o si aún no hay usuario.
    // Nótese que "/" (Dashboard) sí debe cargar los lapsos.
    if (isLoginPage() || !user) {
      if (!user) {
        setLapsos([]);
        setSelectedLapso(null);
      }
      setLoading(false);
      return;
    }
    fetchLapsos();
  }, [user, fetchLapsos]);

  useEffect(() => {
    if (!selectedLapso) return;

    // Persistimos de inmediato para que el interceptor de api.jsx envíe el
    // X-Lapso-Id correcto antes del siguiente render de los módulos.
    localStorage.setItem("lapsoActual", JSON.stringify(selectedLapso));
    setLapsoActual(selectedLapso);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLapso]);

  // Refresco automático: cuando el usuario vuelve a la pestaña (focus / visible)
  // o cuando otra pestaña cambia el lapso seleccionado, se vuelve a consultar el
  // listado para reflejar activaciones o cierres sin necesidad de recargar (F5).
  useEffect(() => {
    const refrescar = () => {
      if (!user) return;
      // Silencioso: no muestra el skeleton ni deshabilita el selector.
      fetchLapsos(true);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") refrescar();
    };

    const onStorage = (event) => {
      if (event.key === "lapsoActual") refrescar();
    };

    window.addEventListener("focus", refrescar);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("focus", refrescar);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
    };
  }, [user, fetchLapsos]);

  const isReadOnly = esCerrado(selectedLapso);

  const value = useMemo(
    () => ({
      lapsos,
      selectedLapso,
      setSelectedLapso,
      isReadOnly,
      isHistorical: isReadOnly,
      loading,
      refreshLapsos: fetchLapsos,
    }),
    [lapsos, selectedLapso, isReadOnly, loading, fetchLapsos],
  );

  return <LapsoContext.Provider value={value}>{children}</LapsoContext.Provider>;
}

/**
 * Hook de acceso al contexto de lapso. Lanza error si se usa fuera del provider.
 */
export function useLapso() {
  const context = useContext(LapsoContext);

  if (!context) {
    throw new Error("useLapso debe usarse dentro de un <LapsoProvider>.");
  }

  return context;
}
