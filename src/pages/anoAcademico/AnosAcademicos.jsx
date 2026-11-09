import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { notify } from "@/components/shared/Notify";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { DataTable } from "@/components/shared/Data_table";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { Guard } from "@/components/shared/Guard";
import React, { useEffect, useState } from "react";
import { AlertTriangle, Activity } from "lucide-react";

import {
  getAllAnos,
  deleteAno,
  forzarInicioAno,
  forzarCierreAno,
} from "@/services/anoService";
import { columnsAnos } from "./columnsAnos";
import CreateAnoModal from "./CreateAnoModal";
import EditAnoModal from "./EditAnoModal";

export default function AnosAcademicos() {
  // Estados requeridos
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAnoId, setEditingAnoId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [statusChangeConfig, setStatusChangeConfig] = useState(null);

  // Carga de datos inicial
  const fetchAnos = async () => {
    try {
      const result = await getAllAnos();
      setData(result.data);
    } catch (error) {
      console.error("Error al obtener los años académicos:", error);
      notify.error(
        "Error al obtener los años académicos. Por favor, inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ano) => {
    setEditingAnoId(ano.id);
  };

  const handleDelete = (ano) => {
    setDeletingId(ano.id);
  };

  const handleStatusChange = (ano, action) => {
    setStatusChangeConfig({ ano, action });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeConfig) return;
    const { ano, action } = statusChangeConfig;
    if (action === "activar") {
      const response = await forzarInicioAno(ano.id);
      const successMessage =
        response?.message ||
        response?.data?.message ||
        "Año académico iniciado con éxito de manera anticipada";
      notify.success(successMessage);
    } else if (action === "cerrar") {
      const response = await forzarCierreAno(ano.id);
      const successMessage =
        response?.message ||
        response?.data?.message ||
        "Año académico cerrado con éxito de manera anticipada";
      notify.success(successMessage);
    }
  };

  useEffect(() => {
    fetchAnos();
  }, []);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Años Académicos", href: "/anos_academicos" },
  ];

  if (loading) {
    return <SkeletonTable />;
  }

  // Configuración dinámica del modal de confirmación de estado
  let modalTitle = "";
  let modalDescription = "";
  let modalConfirmText = "";
  let modalVariant = "default";
  let modalIcon = AlertTriangle;

  if (statusChangeConfig) {
    const { ano, action } = statusChangeConfig;
    if (action === "activar") {
      modalTitle = `¿Confirmar inicio del año académico ${ano.ano}?`;
      modalConfirmText = "Activar";
      
      const tieneAnoActivo = data.some((item) => item.estado_real === "activo");
      if (tieneAnoActivo) {
        modalDescription = `¡Advertencia! Actualmente existe un año académico activo. Si continúas, ese año se cerrará automáticamente para dar inicio al año ${ano.ano}.`;
        modalVariant = "default";
        modalIcon = AlertTriangle;
      } else {
        modalDescription = `Esta acción dará inicio al año académico ${ano.ano}.`;
        modalVariant = "success";
        modalIcon = Activity;
      }
    } else if (action === "cerrar") {
      modalTitle = `¿Confirmar cierre del año académico ${ano.ano}?`;
      modalDescription = `Esta acción cerrará el año académico ${ano.ano} y no se podrá deshacer.`;
      modalConfirmText = "Cerrar";
      modalVariant = "destructive";
      modalIcon = AlertTriangle;
    }
  }

  return (
    <div>
      <h1 className="mb-4 font-sans text-3xl capitalize font-semibold">
        Años Académicos
      </h1>

      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb para la Navegación */}
        <BreadcrumbReusable items={breadcrumbItems} />

        {/* Botón superior para "Nuevo Año" */}
        <Guard requiredPermissions="anoAcademico.crear">
          <div className="flex justify-end">
            <CreateAnoModal fetchAnos={fetchAnos} />
          </div>
        </Guard>

        {/* Modal para Editar */}
        <EditAnoModal
          isOpen={!!editingAnoId}
          anoId={editingAnoId}
          onClose={() => setEditingAnoId(null)}
          onSuccess={fetchAnos}
        />

        {/* Modal para Eliminar */}
        <AlertDialogDestructive
          isOpen={!!deletingId}
          id={deletingId}
          onClose={() => setDeletingId(null)}
          onSuccess={fetchAnos}
          deleteFunction={deleteAno}
        />

        {/* Modal para confirmar cambio de estado */}
        <AlertDialogDestructive
          isOpen={!!statusChangeConfig}
          onClose={() => setStatusChangeConfig(null)}
          onSuccess={fetchAnos}
          title={modalTitle}
          description={modalDescription}
          confirmText={modalConfirmText}
          variant={modalVariant}
          icon={modalIcon}
          onConfirm={handleConfirmStatusChange}
        />
      </div>

      <div className="my-4">
        {/* Tabla de Años Académicos */}
        <DataTable
          columns={columnsAnos(
            handleEdit,
            handleDelete,
            handleStatusChange
          )}
          data={data}
          filterColumn="ano"
        />
      </div>
    </div>
  );
}
