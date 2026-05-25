import React, { useEffect, useState } from "react";
import { notify } from "@/components/shared/Notify";
import CreateCoordinadorModal from "./CreateCoordinadorModal";
import { DataTable } from "@/components/shared/Data_table";
import { deleteCoordinador, getAllCoordinadores, getDocentes } from "@/services/coordinadorService";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { columnsCoordinador } from "./columnsCoordinador";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { Guard } from "@/components/shared/Guard";

/**
 * Página principal para gestionar Coordinadores.
 */
export default function Coordinador() {
    // Estados
    const [coordinadores, setCoordinadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [dataSelect, setDataSelect] = useState([]);

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
                {/* Boton para crear un Coordinador */}
                <Guard requiredPermissions="coordinador.crear">
                    <div className="flex justify-end">
                        <CreateCoordinadorModal fetchCoordinadores={fetchCoordinadores} dataSelect={dataSelect} />
                    </div>
                </Guard>    

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
                    filterColumn="cedula"
                />
            </div>
        </div>
    );
}
