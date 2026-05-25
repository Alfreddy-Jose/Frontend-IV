import { notify } from "@/components/shared/Notify";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { deleteUnidadCurricular, getAllUnidadesCurriculares } from "@/services/unidadCurricularService";
import React, { useEffect, useState } from "react";
import { columnsUnidadCurricular } from "./columnUnidadCurricular";
import { DataTable } from "@/components/shared/Data_table";
import CreateUnidadCurricularModal from "./CreateUnidadCurricularModal";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import EditUnidadCurricularModal from "./EditUnidadCurricularModal";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { getAllTrayectos } from "@/services/trayectoService";
import { Guard } from "@/components/shared/Guard";

export default function UnidadCurricular() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [trayectos, setTrayectos] = useState([]);

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

    const handleEdit = (uc) => setEditingId(uc.id);
    const handleDelete = (uc) => setDeletingId(uc.id);

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

                <Guard requiredPermissions="unidad Curricular.crear">
                    <div className="flex justify-end">
                        <CreateUnidadCurricularModal fetchUnidades={fetchUnidades} trayectos={trayectos} />
                    </div>
                </Guard>

                <EditUnidadCurricularModal
                    isOpen={!!editingId}
                    ucId={editingId}
                    onClose={() => setEditingId(null)}
                    onSuccess={fetchUnidades}
                    trayectos={trayectos}
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
                    columns={columnsUnidadCurricular(handleEdit, handleDelete)}
                    data={data}
                    filterColumn="nombre"
                />
            </div>
        </div>
    );
}
