import React, { useState, useEffect } from "react";
import { notify } from "@/components/shared/Notify";
import { importarEstadistica, descargarPlantilla, dividirSeccion, fusionarSecciones } from "@/services/estadisticaInscripcionService";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import SelectorLapso from "@/components/shared/SelectorLapso";
import { EstadisticaInscripcionSkeleton } from "./EstadisticaInscripcionSkeleton";
import { DropzoneArea } from "./DropzoneArea";
import { TablaAnalisisSecciones } from "./TablaAnalisisSecciones";
import { useAuth } from "@/context/AuthContext";
import { indexSeccion } from "@/services/estadisticaInscripcionService";
import { getAllPnfs } from "@/services/pnfService";
import SelectSearch from "@/components/shared/SelectSearch";
import { Button } from "@/components/ui/button";
import {
    Building2,
    Download,
    Upload,
    AlertTriangle,
    CheckCircle2,
    Split,
    Merge,
    HelpCircle
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FILTERS_KEY = "estadistica_inscripcion_filters";
const SESSION_KEY = "estadistica_inscripcion_state"; // kept for backward compatibility if needed

// Valor del select que representa «sin filtro» (todos los PNF).
const TODOS_LOS_PNF = "todos";

/**
 * Normaliza el PNF del usuario autenticado a un id en texto.
 * El contexto de autenticación puede entregarlo como id, como cadena o como objeto.
 */
function normalizarPnf(valor) {
    if (valor === null || valor === undefined) return "";

    const texto = typeof valor === "object"
        ? String(valor.id ?? valor.pnf_id ?? "")
        : String(valor).trim();

    if (!texto || texto === "null" || texto === "undefined" || texto === "0") {
        return "";
    }

    return texto;
}

/**
 * Nombre del PNF asignado al usuario, para mostrarlo cuando no puede elegirlo.
 */
function obtenerNombrePnf(usuario, pnf) {
    if (usuario?.pnf && typeof usuario.pnf === "object") {
        return usuario.pnf.nombre ?? usuario.pnf.abreviado ?? "";
    }

    if (pnf && typeof pnf === "object") {
        return pnf.nombre ?? pnf.abreviado ?? "";
    }

    return "";
}

/**
 * Recupera los filtros guardados (lapso y PNF elegido por el administrador).
 */
function leerFiltrosGuardados() {
    try {
        const guardado = localStorage.getItem(FILTERS_KEY);
        return guardado ? JSON.parse(guardado) : {};
    } catch (error) {
        console.error("Error al leer los filtros guardados:", error);
        return {};
    }
}

/**
 * Consulta las secciones del lapso indicado.
 * Sin pnfId el administrador obtiene las secciones de todos los PNF.
 */
async function obtenerSecciones(lapsoId, pnfId) {
    const params = { lapso_id: lapsoId };
    if (pnfId) params.pnf_id = pnfId;

    const response = await indexSeccion(params);
    // El servicio retorna response.data directamente
    // el backend puede devolver { secciones: [] } o { data: [] } o [] directamente
    const data = response;

    return data?.secciones ?? data?.data ?? (Array.isArray(data) ? data : []);
}

export default function EstadisticaInscripcion() {
    const { lapsoActual, pnf, user } = useAuth();

    // El backend usa el PNF del usuario autenticado (`$user->pnf`): si tiene un PNF
    // asignado (coordinador) solo ve las secciones de ese PNF; si no lo tiene
    // (administrador) puede elegir cualquiera desde el select.
    const pnfAsignado = normalizarPnf(user?.pnf) || normalizarPnf(pnf);
    const puedeElegirPnf = !pnfAsignado;
    const nombrePnfAsignado = obtenerNombrePnf(user, pnf);

    const [pnfs, setPnfs] = useState([]);
    const [pnfSeleccionado, setPnfSeleccionado] = useState(() => {
        if (pnfAsignado) return "";

        const guardado = leerFiltrosGuardados();
        const pnfGuardado = guardado?.pnf_id ? String(guardado.pnf_id) : "";

        return pnfGuardado || TODOS_LOS_PNF;
    });
    const [pnfSubida, setPnfSubida] = useState(pnfAsignado);

    // Mapa id → nombre para mostrar la columna PNF cuando el administrador ve todos.
    const pnfNombres = React.useMemo(() => {
        if (!puedeElegirPnf) return {};

        return pnfs.reduce((acc, item) => {
            acc[item.id] = item.nombre ?? item.abreviado ?? `PNF #${item.id}`;
            return acc;
        }, {});
    }, [pnfs, puedeElegirPnf]);

    // Opciones del selector de PNF (incluye la opción «Todos los PNF»).
    const opcionesPnfFiltro = React.useMemo(
        () => [{ id: TODOS_LOS_PNF, nombre: "Todos los PNF" }, ...pnfs],
        [pnfs]
    );

    // Adaptadores para reutilizar el mismo selector de los formularios (SelectSearch).
    const formikPnfFiltro = {
        values: { pnfFiltro: pnfSeleccionado },
        setFieldValue: (_field, value) => setPnfSeleccionado(value || TODOS_LOS_PNF),
        setFieldTouched: () => {},
    };

    const formikPnfSubida = {
        values: { pnfSubida },
        setFieldValue: (_field, value) => setPnfSubida(value || ""),
        setFieldTouched: () => {},
    };
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [initialLoading, setInitialLoading] = useState(true);

    React.useEffect(() => {
        // Simula una pequeña carga inicial para mostrar el skeleton
        const timer = setTimeout(() => {
            setInitialLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Results
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [secciones, setSecciones] = useState([]);
    const [conflictMessage, setConflictMessage] = useState(null); // mensaje 409

    // --- CARGA DEL LISTADO DE PNF (SOLO ADMINISTRADOR) Y DE LAS SECCIONES ---
    useEffect(() => {
        if (!puedeElegirPnf) return;

        let activo = true;

        const cargarPnfs = async () => {
            try {
                const response = await getAllPnfs();
                const lista = Array.isArray(response) ? response : response?.data ?? [];

                if (activo) setPnfs(lista);
            } catch (error) {
                console.error("Error al cargar los PNF:", error);
                notify.error("No se pudieron cargar los PNF.");
            }
        };

        cargarPnfs();

        return () => {
            activo = false;
        };
    }, [puedeElegirPnf]);

    // PNF efectivo: el asignado al usuario o el elegido por el administrador.
    const pnfEfectivo = puedeElegirPnf ? pnfSeleccionado : pnfAsignado;

    // PNF que se envía al backend: null = todos (solo aplica al administrador).
    const pnfFiltro = pnfEfectivo && pnfEfectivo !== TODOS_LOS_PNF ? pnfEfectivo : null;

    // Recarga las secciones manteniendo el filtro actual (tras importar/dividir/fusionar).
    const recargarSecciones = async () => {
        if (!lapsoActual?.id) return;

        try {
            const lista = await obtenerSecciones(lapsoActual.id, pnfFiltro);
            setSecciones(lista);
        } catch (e) {
            console.error("Error fetching secciones", e);
            notify.error(e?.response?.data?.message || "No se pudieron cargar las secciones.");
        }
    };

    // Cada cambio de lapso o de PNF refresca el listado de secciones.
    useEffect(() => {
        if (!lapsoActual?.id || !pnfEfectivo) return;

        let activo = true;

        const cargar = async () => {
            try {
                const lista = await obtenerSecciones(lapsoActual.id, pnfFiltro);
                if (activo) setSecciones(lista);
            } catch (e) {
                if (!activo) return;

                console.error("Error fetching secciones", e);
                setSecciones([]);
                notify.error(e?.response?.data?.message || "No se pudieron cargar las secciones.");
            }
        };

        cargar();

        return () => {
            activo = false;
        };
    }, [lapsoActual?.id, pnfEfectivo, pnfFiltro]);

    // --- GUARDA LA PREFERENCIA DE FILTROS (LAPSO + PNF ELEGIDO) ---
    useEffect(() => {
        if (!lapsoActual?.id) return;

        const filters = {
            lapso_id: lapsoActual.id,
            pnf_id: pnfFiltro,
        };

        localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    }, [lapsoActual?.id, pnfFiltro]);

    const items = [
        { label: "Home", href: "/" },
        { label: "Estadística de Inscripción", href: "/estadistica_inscripcion" },
    ];

    // Lógica de carga compartida para importación normal y con reemplazo confirmado
    const executeUpload = async (confirmarReemplazo = false) => {
        // El backend exige el PNF del usuario o el elegido por el administrador.
        const pnfDestino = pnfAsignado || pnfSubida;

        if (!pnfDestino) {
            notify.warning("Selecciona un PNF para asociar el archivo.");
            return;
        }

        setLoading(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress((prev) => (prev >= 90 ? 90 : prev + 15));
        }, 500);

        try {
            const formData = new FormData();
            formData.append("archivo", file);
            formData.append("lapso_id", lapsoActual.id);
            formData.append("pnf_id", pnfDestino);
            if (confirmarReemplazo) {
                formData.append("confirmar_reemplazo", 1);
            }

            const response = await importarEstadistica(formData);

            clearInterval(interval);
            setProgress(100);

            setTimeout(() => {
                setUploadResult(response);
                setShowResultModal(true);
                setShowUploadModal(false);
                setLoading(false);
                setFile(null);
                recargarSecciones();
            }, 500);

        } catch (error) {
            clearInterval(interval);
            setProgress(0);
            setLoading(false);

            const status = error?.response?.status;
            const data = error?.response?.data;

            if (status === 409 && data?.requiere_confirmacion) {
                // Mostrar modal de confirmación al usuario
                setConflictMessage(data.message || "Ya existen datos para este lapso. ¿Deseas sobrescribirlos?");
                return;
            }

            console.error("Error al importar:", error);
            notify.error(data?.message || "Error al procesar el archivo.");
        }
    };

    const handleUploadModalChange = (open) => {
        if (loading) return;

        if (open) {
            // Si el administrador ya filtró un PNF se usa ese; si no, lo elige en el modal.
            setPnfSubida(
                pnfAsignado || (pnfEfectivo === TODOS_LOS_PNF ? "" : pnfEfectivo)
            );
        }

        setShowUploadModal(open);

        if (!open) {
            setFile(null);
            setProgress(0);
            setPnfSubida(pnfAsignado || "");
        }
    };

    const handleUpload = async () => {
        if (!file) {
            notify.warning("Selecciona un archivo primero.");
            return;
        }
        if (!lapsoActual?.id) {
            notify.warning("Selecciona un lapso académico activo.");
            return;
        }
        await executeUpload(false);
    };

    const handleFusionar = async (payload) => {
        try {
            await fusionarSecciones(payload);
            notify.success("Sección fusionada correctamente.");
            // Refresh sections from backend to ensure consistency
            recargarSecciones();
        } catch (error) {
            notify.error(error?.response?.data?.message || "Error al fusionar las secciones.");
            throw error;
        }
    };

    const handleDividir = async (payload) => {
        try {
            await dividirSeccion(payload);
            notify.success("Sección actualizada correctamente.");
            // Refresh sections from backend to ensure consistency
            recargarSecciones();
        } catch (error) {
            notify.error(
                error?.response?.data?.message || "Error al procesar la sección."
            );
            throw error;
        }
    };

    const downloadTemplate = async () => {
        try {
            const data = await descargarPlantilla();
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Plantilla_Estadistica_Inscripcion.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error al descargar la plantilla:', error);
            notify.error("Error al descargar la plantilla.");
        }
    };

    if (initialLoading) {
        return <EstadisticaInscripcionSkeleton />;
    }

    return (
        <div className="animate-in fade-in duration-500">
            <h1 className="mb-4 font-sans text-3xl font-semibold capitalize text-slate-900 dark:text-slate-100">
                Estadística de Inscripción
            </h1>

            <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
                <BreadcrumbReusable items={items} />

                <div className="flex items-center gap-3">
                    <SelectorLapso />

                    {puedeElegirPnf ? (
                        <SelectSearch
                            name="pnfFiltro"
                            options={opcionesPnfFiltro}
                            formik={formikPnfFiltro}
                            valueKey="id"
                            labelKey="nombre"
                            placeholder="Selecciona un PNF"
                            div_style="w-56 shrink-0"
                        />
                    ) : (
                        nombrePnfAsignado && (
                            <span
                                className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                                title="Solo se muestran las secciones de su PNF"
                            >
                                <Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                {nombrePnfAsignado}
                            </span>
                        )
                    )}

                    <Button
                        variant="outline"
                        onClick={downloadTemplate}
                        className="shrink-0 gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Descargar Plantilla
                    </Button>
                    <Button
                        onClick={() => handleUploadModalChange(true)}
                        className="shrink-0 gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Subir Archivo
                    </Button>
                </div>
            </div>

            <Dialog open={showUploadModal} onOpenChange={handleUploadModalChange}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Importar Estadística</DialogTitle>
                        <DialogDescription>
                            Sube el archivo Excel con los datos de las secciones.
                        </DialogDescription>
                    </DialogHeader>

                    {puedeElegirPnf && (
                        <div className="space-y-2">
                            <label
                                htmlFor="pnfSubida"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                PNF al que pertenece el archivo
                            </label>
                            <SelectSearch
                                name="pnfSubida"
                                options={pnfs}
                                formik={formikPnfSubida}
                                valueKey="id"
                                labelKey="nombre"
                                placeholder="Selecciona un PNF"
                                div_style="w-full"
                            />
                            {!pnfSubida && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Selecciona el PNF antes de subir el archivo.
                                </p>
                            )}
                        </div>
                    )}

                    <DropzoneArea
                        file={file}
                        onFileSelect={setFile}
                        onClearFile={() => setFile(null)}
                        loading={loading}
                        progress={progress}
                        onUpload={handleUpload}
                    />
                </DialogContent>
            </Dialog>

            {/* Tabla de análisis — visible tras la importación */}
            <TablaAnalisisSecciones
                secciones={secciones}
                pnfNombres={pnfNombres}
                onDividir={handleDividir}
                onFusionar={handleFusionar}
            />

            <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
                <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                            Importación Finalizada
                        </DialogTitle>
                        <DialogDescription>
                            El archivo ha sido procesado por el sistema.
                        </DialogDescription>
                    </DialogHeader>

                    {uploadResult && (
                        <div className="space-y-4 my-2">
                            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900 rounded-lg">
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200">
                                    Total Procesado: {uploadResult.total_procesado || 0}
                                </Badge>
                                <span className="text-sm text-green-700 dark:text-green-300">
                                    registros actualizados correctamente.
                                </span>
                            </div>

                            {uploadResult?.detalles?.observaciones && uploadResult.detalles.observaciones.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                                        Advertencias y Observaciones
                                    </h4>

                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                        {uploadResult.detalles.observaciones.map((obs, index) => {
                                            // Determine specific icons / actions based on text 
                                            const isWarning = obs.toLowerCase().includes("no encontrad") || obs.includes("7014") || obs.includes("7028");
                                            const isMerge = obs.toLowerCase().includes("fusionar") || obs.toLowerCase().includes("subpoblada") || obs.includes("< 15");
                                            const isSplit = obs.toLowerCase().includes("dividir") || obs.toLowerCase().includes("sobrecargada") || obs.includes("> 45");

                                            let Icon = HelpCircle;
                                            let alertVariant = "default";
                                            if (isWarning) {
                                                Icon = AlertTriangle;
                                                alertVariant = "destructive";
                                            } else if (isMerge) {
                                                Icon = Merge;
                                            } else if (isSplit) {
                                                Icon = Split;
                                            }

                                            return (
                                                <Alert key={index} variant={alertVariant} className="flex gap-2 items-start py-2">
                                                    <Icon className="w-4 h-4 mt-0.5" />
                                                    <div className="flex-1">
                                                        <AlertTitle className="text-xs uppercase opacity-80 mb-1 font-semibold">Observación</AlertTitle>
                                                        <AlertDescription className="text-sm opacity-90">
                                                            {obs}
                                                        </AlertDescription>
                                                    </div>
                                                </Alert>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setShowResultModal(false)}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de confirmación de reemplazo (409 Conflict) */}
            <AlertDialog open={!!conflictMessage} onOpenChange={(open) => { if (!open) setConflictMessage(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Datos existentes
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {conflictMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConflictMessage(null)}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={async () => {
                                setConflictMessage(null);
                                await executeUpload(true);
                            }}
                        >
                            Continuar / Sobrescribir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
