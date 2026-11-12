import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { notify } from "@/components/shared/Notify";
import SelectSearch from "@/components/shared/SelectSearch";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { getAllPnfs } from "@/services/pnfService";
import {
    descargarDocumento,
    eliminarDocumento,
    getAllDocumentos,
    subirDocumento,
} from "@/services/documentoService";
import { Building2, FolderOpen, Upload } from "lucide-react";
import { DocumentGrid } from "./DocumentGrid";
import { DropzoneDocumento } from "./DropzoneDocumento";
import { DocumentoSkeleton } from "./documentoSkeleton";

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

export default function Documento() {
    const { pnf, user } = useAuth();

    // El backend usa el PNF del usuario autenticado (`$user->pnf`): si tiene un PNF
    // asignado (coordinador) solo opera sobre él; si no lo tiene (administrador)
    // puede elegir cualquiera desde el select.
    const pnfAsignado = normalizarPnf(user?.pnf) || normalizarPnf(pnf);
    const puedeElegirPnf = !pnfAsignado;
    const nombrePnfAsignado = obtenerNombrePnf(user, pnf);

    const [pnfSeleccionado, setPnfSeleccionado] = useState(
        () => pnfAsignado || (puedeElegirPnf ? TODOS_LOS_PNF : "")
    );
    const [pnfSubida, setPnfSubida] = useState(pnfAsignado);
    const [pnfs, setPnfs] = useState([]);
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [deletingId, setDeletingId] = useState(null);

    // Identifica la última petición para descartar respuestas fuera de orden.
    const peticionRef = useRef(0);

    // Opciones del selector de PNF (incluye la opción «Todos los PNF»).
    const opcionesPnfFiltro = useMemo(
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

    const items = [
        { label: "Home", href: "/" },
        { label: "Documentos", href: "/documentos" },
    ];

    useEffect(() => {
        const timer = setTimeout(() => setInitialLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // Mantiene sincronizado el PNF asignado cuando el contexto resuelve la sesión.
    useEffect(() => {
        if (!pnfAsignado) return;

        setPnfSeleccionado(pnfAsignado);
        setPnfSubida(pnfAsignado);
    }, [pnfAsignado]);

    // Solo quien no tiene PNF asignado (administrador) necesita el listado de PNF.
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

    const fetchDocumentos = useCallback(async (pnfId) => {
        const peticion = peticionRef.current + 1;
        peticionRef.current = peticion;

        if (!pnfId) {
            setDocumentos([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            // «todos» se envía sin pnf_id: el administrador ve los documentos de todos los PNF.
            const params = pnfId === TODOS_LOS_PNF ? {} : { pnf_id: pnfId };
            const response = await getAllDocumentos(params);

            if (peticion !== peticionRef.current) return;

            const lista = Array.isArray(response) ? response : response?.data ?? [];
            setDocumentos(lista);
        } catch (error) {
            if (peticion !== peticionRef.current) return;

            console.error("Error al obtener los documentos:", error);
            setDocumentos([]);
            notify.error(
                error?.response?.data?.message || "No se pudieron cargar los documentos."
            );
        } finally {
            if (peticion === peticionRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocumentos(pnfSeleccionado);
    }, [fetchDocumentos, pnfSeleccionado]);

    const handleUpload = async () => {
        // El PNF de destino es el del usuario o el elegido en el modal por el administrador.
        const pnfDestino = pnfAsignado || pnfSubida;

        if (!file) {
            notify.warning("Selecciona un documento primero.");
            return;
        }

        if (!pnfDestino) {
            notify.warning("Selecciona un PNF para asociar el documento.");
            return;
        }

        setUploading(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
        }, 400);

        try {
            const formData = new FormData();
            formData.append("archivo", file);
            formData.append("pnf_id", pnfDestino);

            const response = await subirDocumento(formData, (event) => {
                if (event.total) {
                    setProgress(Math.round((event.loaded * 100) / event.total));
                }
            });

            clearInterval(interval);
            setProgress(100);

            notify.success(response?.message || "Documento subido correctamente.");
            setShowUploadModal(false);
            setFile(null);
            await fetchDocumentos(pnfSeleccionado);
        } catch (error) {
            clearInterval(interval);
            setProgress(0);
            notify.error(error?.response?.data?.message || "Error al subir el documento.");
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (documento) => {
        try {
            const blob = await descargarDocumento(documento.id);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = window.document.createElement("a");

            link.href = url;
            link.setAttribute("download", documento.nombre);
            window.document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error al descargar el documento:", error);
            notify.error(
                error?.response?.data?.message || "No se pudo descargar el documento."
            );
        }
    };

    const handleUploadModalChange = (open) => {
        if (uploading) return;

        if (open) {
            // Si el administrador ya filtró un PNF se usa ese; si no, lo elige en el modal.
            setPnfSubida(
                pnfAsignado || (pnfSeleccionado === TODOS_LOS_PNF ? "" : pnfSeleccionado)
            );
        }

        setShowUploadModal(open);

        if (!open) {
            setFile(null);
            setProgress(0);
            setPnfSubida(pnfAsignado || "");
        }
    };

    if (initialLoading) {
        return <DocumentoSkeleton />;
    }

    return (
        <div className="animate-in fade-in duration-500">
            <h1 className="mb-4 font-sans text-3xl font-semibold capitalize text-slate-900 dark:text-slate-100">
                Documentos
            </h1>

            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <BreadcrumbReusable items={items} />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    {puedeElegirPnf ? (
                        <SelectSearch
                            name="pnfFiltro"
                            options={opcionesPnfFiltro}
                            formik={formikPnfFiltro}
                            valueKey="id"
                            labelKey="nombre"
                            placeholder="Selecciona un PNF"
                            div_style="w-full sm:w-64"
                        />
                    ) : (
                        nombrePnfAsignado && (
                            <span
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                                title="Solo se muestran los documentos de su PNF"
                            >
                                <Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                {nombrePnfAsignado}
                            </span>
                        )
                    )}

                    <Button
                        onClick={() => handleUploadModalChange(true)}
                        className="gap-2"
                    >
                        <Upload className="h-4 w-4" />
                        Subir Documento
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                {loading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex animate-pulse flex-col items-center justify-center gap-2 rounded-xl border border-transparent p-3"
                            >
                                <div className="h-10 w-10 rounded-md bg-slate-200 dark:bg-slate-800" />
                                <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
                            </div>
                        ))}
                    </div>
                ) : documentos.length > 0 ? (
                    <DocumentGrid
                        documentos={documentos}
                        onDownload={handleDownload}
                        onDelete={(documento) => setDeletingId(documento.id)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-900">
                            <FolderOpen className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            {!pnfSeleccionado
                                ? "Selecciona un PNF para ver sus documentos."
                                : pnfSeleccionado === TODOS_LOS_PNF
                                    ? "Todavía no hay documentos registrados en ningún PNF."
                                    : "Este PNF aún no tiene documentos."}
                        </p>
                        {pnfSeleccionado && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Usa el botón «Subir Documento» para agregar el primero.
                            </p>
                        )}
                    </div>
                )}
            </div>

            <Dialog open={showUploadModal} onOpenChange={handleUploadModalChange}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Subir Documento</DialogTitle>
                        <DialogDescription>
                            Formatos permitidos: PDF, Word, Excel e imágenes (máx. 10 MB).
                        </DialogDescription>
                    </DialogHeader>

                    {puedeElegirPnf && (
                        <div className="space-y-2">
                            <label
                                htmlFor="pnfSubida"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                PNF al que pertenece el documento
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
                                    Selecciona el PNF antes de subir el documento.
                                </p>
                            )}
                        </div>
                    )}

                    <DropzoneDocumento
                        file={file}
                        onFileSelect={setFile}
                        onClearFile={() => setFile(null)}
                        loading={uploading}
                        progress={progress}
                        onUpload={handleUpload}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialogDestructive
                isOpen={!!deletingId}
                id={deletingId}
                onClose={() => setDeletingId(null)}
                onSuccess={() => fetchDocumentos(pnfSeleccionado)}
                deleteFunction={eliminarDocumento}
                title="¿Eliminar documento?"
                description="El archivo se eliminará permanentemente del servidor. Esta acción no se puede deshacer."
                confirmText="Eliminar"
            />
        </div>
    );
}
