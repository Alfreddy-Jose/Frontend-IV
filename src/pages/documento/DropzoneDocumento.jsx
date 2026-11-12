import React, { useCallback, useRef, useState } from "react";
import { notify } from "@/components/shared/Notify";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, X } from "lucide-react";
import { formatearTamano, obtenerIconoArchivo } from "./fileUtils";

const ACEPTADOS = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.webp,.gif";

/**
 * Zona de carga con drag & drop, mismo diseño usado en Estadística de Inscripción.
 */
export function DropzoneDocumento({
    file,
    onFileSelect,
    onClearFile,
    loading,
    progress,
    onUpload,
}) {
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef(null);

    const validarArchivo = (archivo) => {
        const nombre = archivo?.name || "";
        const permitido = /\.(pdf|doc|docx|xls|xlsx|csv|jpg|jpeg|png|webp|gif)$/i.test(nombre);

        if (!permitido) {
            notify.error("Solo se permiten archivos PDF, Word, Excel o imágenes.");
            return false;
        }

        if (archivo.size > 10 * 1024 * 1024) {
            notify.error("El documento no debe pesar más de 10 MB.");
            return false;
        }

        return true;
    };

    const handleDragEnter = useCallback((event) => {
        event.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((event) => {
        event.preventDefault();
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsDragOver(false);
        }
    }, []);

    const handleDrop = useCallback(
        (event) => {
            event.preventDefault();
            setIsDragOver(false);

            const archivo = event.dataTransfer.files?.[0];
            if (archivo && validarArchivo(archivo)) {
                onFileSelect(archivo);
            }
        },
        [onFileSelect]
    );

    const handleFileChange = (event) => {
        const archivo = event.target.files?.[0];
        if (archivo && validarArchivo(archivo)) {
            onFileSelect(archivo);
        }

        if (inputRef.current) inputRef.current.value = "";
    };

    const handleClick = () => {
        if (!file && !loading && inputRef.current) {
            inputRef.current.click();
        }
    };

    const { Icon, colorClass } = obtenerIconoArchivo(file?.name || "");

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-colors
                    ${isDragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-gray-200 dark:border-slate-800"}
                    ${file ? "bg-slate-50 dark:bg-slate-900" : ""}
                    ${!file && !loading ? "cursor-pointer hover:border-blue-400 hover:bg-slate-50 dark:hover:border-blue-500 dark:hover:bg-slate-800/50" : ""}
                `}
            >
                <input
                    type="file"
                    ref={inputRef}
                    onChange={handleFileChange}
                    accept={ACEPTADOS}
                    className="hidden"
                    id="documento-file-upload"
                />

                <div className="pointer-events-none">
                    {!file && !loading && (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                                <UploadCloud className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="mb-1 text-lg font-medium text-slate-900 dark:text-slate-100">
                                    Arrastra y suelta tu documento aquí
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    o haz clic para examinar (PDF, Word, Excel o imágenes · máx. 10 MB)
                                </p>
                            </div>
                            <Button
                                type="button"
                                className="pointer-events-auto"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    inputRef.current?.click();
                                }}
                            >
                                Seleccionar Archivo
                            </Button>
                        </div>
                    )}

                    {file && !loading && (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="pointer-events-auto relative rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                                <Icon className={`h-10 w-10 ${colorClass}`} strokeWidth={1.5} />
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onClearFile();
                                    }}
                                    className="absolute -right-2 -top-2 rounded-full bg-red-100 p-1 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400"
                                    aria-label="Quitar archivo"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div>
                                <h3 className="mb-1 text-lg font-medium text-slate-900 dark:text-slate-100">
                                    Documento seleccionado
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {file.name} ({formatearTamano(file.size)})
                                </p>
                            </div>
                            <Button
                                type="button"
                                className="pointer-events-auto mt-4 px-8"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onUpload();
                                }}
                            >
                                Subir Documento
                            </Button>
                        </div>
                    )}

                    {loading && (
                        <div className="pointer-events-auto mx-auto flex w-full max-w-md flex-col items-center justify-center space-y-6">
                            <div className="animate-pulse rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                                <UploadCloud className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="w-full text-center">
                                <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-slate-100">
                                    Subiendo documento...
                                </h3>
                                <Progress value={progress} className="h-3 w-full" />
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    Por favor espera, guardando el archivo...
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
