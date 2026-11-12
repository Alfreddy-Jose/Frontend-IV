import { notify } from "@/components/shared/Notify";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { deleteUnidadCurricular, exportarUnidadesCurricularesPdf, getAllUnidadesCurriculares } from "@/services/unidadCurricularService";
import React, { useEffect, useState } from "react";
import { columnsUnidadCurricular } from "./columnUnidadCurricular";
import { DataTable } from "@/components/shared/Data_table";
import { BookOpen, Download } from "lucide-react";
import GenericShowModal from "@/components/shared/GenericShowModal";
import { unidadCurricularSections } from "./unidadCurricularSections.jsx";
import CreateUnidadCurricularModal from "./CreateUnidadCurricularModal";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import EditUnidadCurricularModal from "./EditUnidadCurricularModal";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { getAllTrayectos } from "@/services/trayectoService";
import { Guard } from "@/components/shared/Guard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getPnfs } from "@/services/sedeService";

export default function UnidadCurricular() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [trayectos, setTrayectos] = useState([]);
    const [selectedUC, setSelectedUC] = useState(null);
    const [isShowModalOpen, setIsShowModalOpen] = useState(false);
    const [pnfs, setPnfs] = useState([]);
    const [descargandoPdf, setDescargandoPdf] = useState(false);
    const { pnf } = useAuth();

    const fetchUnidades = async () => {
        try {
            const ucs = await getAllUnidadesCurriculares();
            setData(ucs);
        } catch (error) {
            console.error("Error fetching unidades curriculares:", error);
            notify.error("Error al obtener las unidades curriculares.");
        } finally {
            setLoading(false);
        }
    };

    // fetch para traer los trayectos
    useEffect(() => {
        const fetchTrayectos = async () => {
            try {
                const trayecto = await getAllTrayectos();
                setTrayectos(trayecto);
            } catch (error) {
                console.error("Error al obtener los estados:", error);
                setTrayectos([]);
            }
        };

        fetchTrayectos();
    }, []);

    useEffect(() => {
        fetchUnidades();
    }, []);

    // fetch para traer los PNFS
    useEffect(() => {
        const fetchPnfs = async () => {
            try {
                const response = await getPnfs();
                setPnfs(response || []);
            } catch (error) {
                console.error("Error al obtener los PNFS:", error);
                setPnfs([]);
            }
        };
        fetchPnfs();
    }, []);

    const handleEdit = (uc) => setEditingId(uc.id);
    const handleDelete = (uc) => setDeletingId(uc.id);
    const handleShow = (uc) => {
        setSelectedUC(uc);
        setIsShowModalOpen(true);
    };

    // Exportar reporte de unidades curriculares a Pdf
    const handleDescargarPdf = async () => {
        try {
            setDescargandoPdf(true);

            await notify.promise(
                (async () => {
                    const blobData = await exportarUnidadesCurricularesPdf();
                    const url = window.URL.createObjectURL(new Blob([blobData]));
                    const link = document.createElement("a");
                    link.href = url;
                    const fecha = new Date().toISOString().slice(0, 10);
                    link.setAttribute("download", `REPORTE_UNIDADES_CURRICULARES_${fecha}.pdf`);
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

    const items = [
        { label: "Home", href: "/" },
        { label: "Unidades Curriculares", href: "/unidades_curriculares" },
    ];

    if (loading) return <SkeletonTable />;

    return (
        <div>
            <h1 className="mb-4 font-sans text-3xl capitalize font-semibold">Unidades Curriculares</h1>
            <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
                <BreadcrumbReusable items={items} />

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

                    <Guard requiredPermissions="unidad Curricular.crear">
                        <CreateUnidadCurricularModal
                            fetchUnidades={fetchUnidades}
                            trayectos={trayectos}
                            pnfs={pnfs}
                            pnfId={pnf}
                        />
                    </Guard>
                </div>

                <EditUnidadCurricularModal
                    isOpen={!!editingId}
                    ucId={editingId}
                    onClose={() => setEditingId(null)}
                    onSuccess={fetchUnidades}
                    trayectos={trayectos}
                    pnfs={pnfs}
                    pnfId={pnf}
                />

                <AlertDialogDestructive
                    isOpen={!!deletingId}
                    id={deletingId}
                    onClose={() => setDeletingId(null)}
                    onSuccess={fetchUnidades}
                    deleteFunction={deleteUnidadCurricular}
                />
            </div>
            <div className="my-4">
                <DataTable
                    columns={columnsUnidadCurricular(handleEdit, handleDelete, handleShow)}
                    data={data}
                    filterColumn="nombre"
                />
            </div>

            <GenericShowModal
                isOpen={isShowModalOpen}
                onClose={() => {
                    setIsShowModalOpen(false);
                    setSelectedUC(null);
                }}
                title="Detalles de la Unidad Curricular"
                description={selectedUC?.nombre || ""}
                icon={BookOpen}
                data={selectedUC}
                sections={unidadCurricularSections}
            />
        </div>
    );
}
