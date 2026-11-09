import React, { useState, useRef, useCallback } from "react";
import { notify } from "@/components/shared/Notify";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileSpreadsheet, X } from "lucide-react";

export function DropzoneArea({ file, onFileSelect, onClearFile, loading, progress, onUpload }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        // Prevent flashing by ignoring events bubbling from children
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragOver(false);
        }
    }, []);

    const validateFile = (fileToValidate) => {
        const validExtensions = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv"
        ];
        if (!validExtensions.includes(fileToValidate.type) && !fileToValidate.name.match(/\.(xlsx|xls|csv)$/i)) {
            notify.error("Por favor, sube un archivo Excel (.xlsx, .xls) o CSV.");
            return false;
        }
        return true;
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (validateFile(droppedFile)) {
                onFileSelect(droppedFile);
            }
        }
    }, [onFileSelect]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                onFileSelect(selectedFile);
            }
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleClick = () => {
        if (!file && !loading && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl p-8 shadow-sm">
            <div
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors
            ${isDragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-gray-200 dark:border-slate-800"}
            ${file ? "bg-slate-50 dark:bg-slate-900" : ""}
            ${!file && !loading ? "cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50" : ""}
          `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    id="file-upload"
                />

                {/* Contenedor transparente para los hijos (evita flickering al arrastrar sobre ellos) */}
                <div className="pointer-events-none">
                    {!file && !loading && (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
                                <UploadCloud className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
                                    Arrastra y suelta tu archivo aquí
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    o haz clic para examinar (formatos soportados: .xlsx, .xls, .csv)
                                </p>
                            </div>
                            <Button className="pointer-events-auto" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                                Seleccionar Archivo
                            </Button>
                        </div>
                    )}

                    {file && !loading && (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full relative pointer-events-auto">
                                <FileSpreadsheet className="w-10 h-10 text-green-600 dark:text-green-400 pointer-events-none" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClearFile();
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-900/50 rounded-full p-1 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
                                    Archivo seleccionado
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                </p>
                            </div>
                            <Button className="px-8 mt-4 pointer-events-auto" onClick={(e) => { e.stopPropagation(); onUpload(); }}>
                                Procesar Archivo
                            </Button>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-md mx-auto pointer-events-auto">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full animate-pulse">
                                <UploadCloud className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="w-full text-center">
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                                    Subiendo y procesando estadísticas...
                                </h3>
                                <Progress value={progress} className="w-full h-3" />
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    Por favor espera, evaluando secciones...
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
