import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { notify } from "@/components/shared/Notify";
import { deleteLapso, getAllLapsos, getTipoLapso } from "@/services/lapsoService";
import React, { useEffect, useState } from "react";
import { columnsLapso } from "./columnsLapso";
import { DataTable } from "@/components/shared/Data_table";
import CreateLapsoModal from "./CreateLapsoModal";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import EditarLapsoModal from "./EditarLapsoModal";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { Guard } from "@/components/shared/Guard";

export default function Lapso() {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLapsoId, setEditingLapsoId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [tiposLapsos, setTiposLapsos] = useState([]);

  const fetchLapsos = async () => {
    try {
      const lapsos = await getAllLapsos();
      setData(lapsos);
    } catch (error) {
      console.error("Error fetching lapsos:", error);
      notify.error(
        "Error al obtener los lapsos. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lapso) => {
    setEditingLapsoId(lapso.id);
  };

  const handleDelete = (lapso) => {
    setDeletingId(lapso.id);
  };

  useEffect(() => {
    fetchLapsos();
  }, []);

  useEffect(() => {
    const fetchTipoLapsos = async () => {
      const tiposLapsosData = await getTipoLapso();
      setTiposLapsos(tiposLapsosData);
    };
    fetchTipoLapsos();
  }, []);

  const items = [
    { label: "Home", href: "/" },
    { label: "Lapsos Académicos", href: "/lapsos" },
  ];

  if (loading) {
    return <SkeletonTable />;
  }

  return (
      <div>
        <h1 className="mb-4 font-sans capitalize text-3xl font-semibold">Lapsos Académicos</h1>
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          {/* Breadcrumb para la Navegación  */}
          <BreadcrumbReusable items={items} />
  
          {/* Boton para crear un Lapso  */}
          <Guard requiredPermissions="lapso.crear">
            <div className="flex justify-end">
              <CreateLapsoModal fetchLapsos={fetchLapsos} tiposLapsos={tiposLapsos} />
            </div>
          </Guard>
  
          {/* modal para Editar */}
          <EditarLapsoModal
            tiposLapsos={tiposLapsos }
            isOpen={!!editingLapsoId}
            lapsoId={editingLapsoId}
            onClose={() => setEditingLapsoId(null)}
            onSuccess={fetchLapsos}
          />
  
          {/* Modal de confirmación y eliminación del usuario */}
          <AlertDialogDestructive
            isOpen={!!deletingId}
            id={deletingId}
            onClose={() => setDeletingId(null)}
            onSuccess={fetchLapsos}
            deleteFunction={deleteLapso}
          />
  
        </div>
        <div className="my-4">
          {/* Tabla de Usuarios */}
          <DataTable
            columns={columnsLapso(handleEdit, handleDelete)}
            data={data}
            filterColumn="nombre_lapso"
          />
        </div>
      </div>
    );
}
