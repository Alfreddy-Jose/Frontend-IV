import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { notify } from "@/components/shared/Notify";
import {
  deleteLapso,
  getAllLapsos,
  getDataSelect,
  forzarInicioLapso,
  forzarCierreLapso,
} from "@/services/lapsoService";
import React, { useEffect, useState } from "react";
import { columnsLapso } from "./columnsLapso";
import { DataTable } from "@/components/shared/Data_table";
import CreateLapsoModal from "./CreateLapsoModal";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import EditarLapsoModal from "./EditarLapsoModal";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { Guard } from "@/components/shared/Guard";
import { AlertTriangle, Activity } from "lucide-react";

export default function Lapso() {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLapsoId, setEditingLapsoId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [dataSelect, setDataSelect] = useState([]);
  const [statusChangeConfig, setStatusChangeConfig] = useState(null);

  const fetchLapsos = async () => {
    try {
      const lapsos = await getAllLapsos();
      setData(lapsos.data);
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

  const handleForzarInicio = (lapso) => {
    setStatusChangeConfig({ lapso, action: "activar" });
  };

  const handleForzarCierre = (lapso) => {
    setStatusChangeConfig({ lapso, action: "cerrar" });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeConfig) return;
    const { lapso, action } = statusChangeConfig;
    if (action === "activar") {
      const response = await forzarInicioLapso(lapso.id);
      const successMessage =
        response?.message ||
        response?.data?.message ||
        "Lapso académico iniciado con éxito.";
      notify.success(successMessage);
    } else if (action === "cerrar") {
      const response = await forzarCierreLapso(lapso.id);
      const successMessage =
        response?.message ||
        response?.data?.message ||
        "Lapso académico cerrado con éxito.";
      notify.success(successMessage);
    }
  };

  useEffect(() => {
    fetchLapsos();
  }, []);

  useEffect(() => {
    const fetchSelectData = async () => {
      const dataSelect = await getDataSelect();
      setDataSelect(dataSelect);
    };
    fetchSelectData();
  }, []);

  const items = [
    { label: "Home", href: "/" },
    { label: "Lapsos Académicos", href: "/lapsos" },
  ];

  if (loading) {
    return <SkeletonTable />;
  }

  // Configuración dinámica para el modal de cambio de estado
  let modalDescription = "";
  let modalConfirmText = "";
  let modalVariant = "default";
  let modalIcon = AlertTriangle;

  if (statusChangeConfig) {
    const { lapso, action } = statusChangeConfig;
    if (action === "activar") {
      modalConfirmText = "Iniciar Lapso";
      modalVariant = "default";
      modalIcon = Activity;

      const otroLapsoActivo = data.find(
        (item) =>
          item.tipo_lapso_id === lapso.tipo_lapso_id &&
          item.estado === "activo" &&
          item.id !== lapso.id
      );

      if (otroLapsoActivo) {
        modalDescription = `¡Advertencia! Actualmente se encuentra activo el lapso '${otroLapsoActivo.nombre_lapso}' del año ${otroLapsoActivo.ano_perteneciente}. Si continúas, ese período se cerrará automáticamente para dar inicio al nuevo lapso.`;
        modalIcon = AlertTriangle;
      } else {
        modalDescription = "¿Estás seguro de que deseas iniciar este lapso académico de forma manual?";
      }
    } else if (action === "cerrar") {
      modalDescription = "¿Estás seguro de que deseas cerrar este lapso académico? Esta acción no se puede deshacer.";
      modalConfirmText = "Cerrar Lapso";
      modalVariant = "destructive";
      modalIcon = AlertTriangle;
    }
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
            <CreateLapsoModal fetchLapsos={fetchLapsos} dataSelect={dataSelect} />
          </div>
        </Guard>

        {/* modal para Editar */}
        <EditarLapsoModal
          dataSelect={dataSelect}
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

        {/* Modal para confirmar cambio de estado */}
        <AlertDialogDestructive
          isOpen={!!statusChangeConfig}
          onClose={() => setStatusChangeConfig(null)}
          onSuccess={fetchLapsos}
          title="¿Confirmar cambio de estado?"
          description={modalDescription}
          confirmText={modalConfirmText}
          variant={modalVariant}
          icon={modalIcon}
          id={statusChangeConfig?.lapso?.id}
          deleteFunction={statusChangeConfig?.action === "activar" ? forzarInicioLapso : forzarCierreLapso}
          onConfirm={handleConfirmStatusChange}
        />

      </div>
      <div className="my-4">
        {/* Tabla de Lapsos Académicos */}
        <DataTable
          columns={columnsLapso(handleEdit, handleDelete, handleForzarInicio, handleForzarCierre)}
          data={data}
          filterColumn="nombre_lapso"
        />
      </div>
    </div>
  );
}
