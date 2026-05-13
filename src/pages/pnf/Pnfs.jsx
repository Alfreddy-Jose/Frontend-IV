import { notify } from "@/components/shared/Notify";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { deletePnf, getAllPnfs } from "@/services/pnfService";
import React, { useEffect, useState } from "react";
import { columnsPnfs } from "./columnsPnfs";
import { DataTable } from "@/components/shared/Data_table";
import CreatePnfModal from "./CreatePnfModal";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import EditPnfModal from "./EditPnfModal";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { getAllTrayectos } from "@/services/trayectoService";

export default function Pnfs() {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPnfId, setEditingPnfId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [trayectos, setTrayectos] = useState([]);

  const fetchPnfs = async () => {
    try {
      const users = await getAllPnfs();
      setData(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      notify.error(
        "Error al obtener los usuarios. Por favor, inténtalo de nuevo.",
      );
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

  const handleEdit = (pnf) => {
    setEditingPnfId(pnf.id);
  };

  const handleDelete = (pnf) => {
    setDeletingId(pnf.id);
  };

  useEffect(() => {
    fetchPnfs();
  }, []);

  const items = [
    { label: "Home", href: "/" },
    { label: "Pnfs", href: "/pnfs" },
  ];

  if (loading) {
    return <SkeletonTable />;
  }

  return (
    <div>
      <h1 className="mb-4 font-sans text-3xl font-semibold">Pnfs</h1>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb para la Navegación  */}
        <BreadcrumbReusable items={items} />

        {/* boton de agregar PNF al lado derecho  */}
        <div className="flex justify-end">
          <CreatePnfModal fetchPnfs={fetchPnfs} trayectos={trayectos} />
        </div>

        {/* modal para Editar */}
        <EditPnfModal
          isOpen={!!editingPnfId}
          pnfId={editingPnfId}
          onClose={() => setEditingPnfId(null)}
          onSuccess={fetchPnfs}
          trayectos={trayectos}
        />

        {/* modal para Eliminar */}
        <AlertDialogDestructive 
          isOpen={!!deletingId}
          id={deletingId}
          onClose={() => setDeletingId(null)}
          onSuccess={fetchPnfs}
          deleteFunction={deletePnf}
        />
      </div>
      <div className="my-4">
        {/* Tabla de Usuarios */}
        <DataTable
          columns={columnsPnfs(handleEdit, handleDelete)}
          data={data}
          filterColumn="nombre"
        />
      </div>
    </div>
  );
}
