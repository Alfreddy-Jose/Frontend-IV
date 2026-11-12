import React, { useEffect, useState } from "react";
import { notify } from "@/components/shared/Notify";
import CreateCoordinadorModal from "./CreateCoordinadorModal";
import { DataTable } from "@/components/shared/Data_table";
import { deleteCoordinador, exportarCoordinadoresPdf, getAllCoordinadores, getDocentes } from "@/services/coordinadorService";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { columnsCoordinador } from "./columnsCoordinador";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { Guard } from "@/components/shared/Guard";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

/**
 * Página principal para gestionar Coordinadores.
 */
export default function Coordinador() {
    // Estados
    const [coordinadores, setCoordinadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [dataSelect, setDataSelect] = useState([]);
    const [descargandoPdf, setDescargandoPdf] = useState(false);

    // --------------------------- Fetch data ---------------------------
    const fetchCoordinadores = async () => {
        try {
            setLoading(true);
            const response = await getAllCoordinadores();
            setCoordinadores(response);
        } catch (error) {
            console.error("Error al cargar coordinadores:", error);
            notify.error("No se pudieron cargar los coordinadores.");
        } finally {
            setLoading(false);
        }
    };
    // fetc para traer los docentes
    const fetchDocentes = async () => {
        try {
            const resp = await getDocentes(0);
            setDataSelect(resp || []);
        } catch (error) {
            console.error("Error al cargar docentes:", error);
        }
    };

    useEffect(() => {
        fetchCoordinadores();
        fetchDocentes();
    }, []);

    // --------------------------- Handlers ---------------------------
    const handleDelete = (coordinador) => {
        setDeletingId(coordinador.id);
    };

    // Exportar reporte de coordinadores a Pdf
    const handleDescargarPdf = async () => {
        try {
            setDescargandoPdf(true);

            await notify.promise(
                (async () => {
                    const blobData = await exportarCoordinadoresPdf();
                    const url = window.URL.createObjectURL(new Blob([blobData]));
                    const link = document.createElement("a");
                    link.href = url;
                    const fecha = new Date().toISOString().slice(0, 10);
                    link.setAttribute("download", `REPORTE_COORDINADORES_${fecha}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                    window.URL.revokeObjectURL(url);
                })(),
                {
                    loading: "Generando reporte...",
                    success: "Reporte PDF descargado con éxito",
                    error: "No se pudo procesar el archivo PDF",
                },
            );
        } catch (error) {
            console.error("Error al descargar reporte:", error);
        } finally {
            setDescargandoPdf(false);
        }
    };

    // --------------------------- Breadcrumb ---------------------------
    const items = [
        { label: "Inicio", href: "/" },
        { label: "Coordinadores", href: "/coordinadores" },
    ]

    if (loading) {
      return <SkeletonTable />;
    }

    return (
        <div>
            {/* Header */}
            <h1 className="mb-4 font-sans capitalize text-3xl font-semibold">Coordinadores</h1>
            <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
                {/* Breadcrumb */}
                <BreadcrumbReusable items={items} />
                {/* Botón de reporte + Boton para crear un Coordinador */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={handleDescargarPdf}
                        disabled={descargandoPdf}
                        className="flex items-center gap-2 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:hover:bg-slate-800"
                    >
                        {descargandoPdf ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                        ) : (
                            <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        )}
                        <span className="hidden sm:inline">
                            {descargandoPdf ? "Procesando..." : "Descargar Reporte"}
                        </span>
                    </Button>

                    <Guard requiredPermissions="coordinador.crear">
                        <div className="flex justify-end">
                            <CreateCoordinadorModal fetchCoordinadores={fetchCoordinadores} dataSelect={dataSelect} />
                        </div>
                    </Guard>
                </div>

                {/* Delete confirmation dialog */}
                <AlertDialogDestructive
                    isOpen={!!deletingId}
                    id={deletingId}
                    onClose={() => setDeletingId(null)}
                    onSuccess={fetchCoordinadores}
                    deleteFunction={deleteCoordinador}
                />

            </div>
            <div className="my-4">
                {/* Data Table */}
                <DataTable
                    columns={columnsCoordinador(handleDelete)}
                    data={coordinadores}
                    loading={loading}
                    filterColumn="nombre"
                />
            </div>
        </div>
    );
}
