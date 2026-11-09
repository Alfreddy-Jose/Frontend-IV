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
import { Button } from "@/components/ui/button";
import {
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

export default function EstadisticaInscripcion() {
    const { lapsoActual } = useAuth();
    const FILTERS_KEY = "estadistica_inscripcion_filters";
    const SESSION_KEY = "estadistica_inscripcion_state"; // kept for backward compatibility if needed
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

    // --- LOAD FILTERS FROM LOCAL STORAGE AND FETCH SECTIONS FROM BACKEND ---
    const loadFilters = () => {
        const saved = localStorage.getItem(FILTERS_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return { lapso_id: parsed.lapso_id || null, pnf_id: parsed.pnf_id || null };
            } catch (e) {
                console.error("Error parsing filters from localStorage", e);
            }
        }
        return {};
    };

    const fetchSecciones = async (lapsoId, pnfId) => {
        try {
            const response = await indexSeccion({ lapso_id: lapsoId, pnf_id: pnfId });
            // El servicio retorna response.data directamente
            // el backend puede devolver { secciones: [] } o { data: [] } o [] directamente
            const data = response;
            const seccList = data?.secciones ?? data?.data ?? (Array.isArray(data) ? data : []);
            setSecciones(seccList);
        } catch (e) {
            console.error("Error fetching secciones", e);
            notify.error("No se pudieron cargar las secciones.");
        }
    };

    React.useEffect(() => {
        if (!lapsoActual?.id) return;
        const filters = loadFilters();
        // Ensure lapso filter matches current lapsoActual
        const lapsoId = lapsoActual.id;
        fetchSecciones(lapsoId, filters.pnf_id);
    }, [lapsoActual?.id]);

    // --- SAVE FILTER PREFERENCES TO LOCAL STORAGE ---
    React.useEffect(() => {
        if (lapsoActual?.id) {
            const filters = { lapso_id: lapsoActual.id };
            localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
        }
    }, [lapsoActual?.id]);

    const items = [
        { label: "Home", href: "/" },
        { label: "Estadística de Inscripción", href: "/estadistica_inscripcion" },
    ];

    // Lógica de carga compartida para importación normal y con reemplazo confirmado
    const executeUpload = async (confirmarReemplazo = false) => {
        setLoading(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress((prev) => (prev >= 90 ? 90 : prev + 15));
        }, 500);

        try {
            const formData = new FormData();
            formData.append("archivo", file);
            formData.append("lapso_id", lapsoActual.id);
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
                fetchSecciones(lapsoActual?.id);
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
            fetchSecciones(lapsoActual?.id);
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
            fetchSecciones(lapsoActual?.id);
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

                <div className="flex items-center gap-4">
                    <SelectorLapso />

                    <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                        <Download className="w-4 h-4" />
                        Descargar Plantilla
                    </Button>
                    <Button onClick={() => setShowUploadModal(true)} className="gap-2">
                        <Upload className="w-4 h-4" />
                        Subir Archivo
                    </Button>
                </div>
            </div>

            <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Importar Estadística</DialogTitle>
                        <DialogDescription>
                            Sube el archivo Excel con los datos de las secciones.
                        </DialogDescription>
                    </DialogHeader>

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
