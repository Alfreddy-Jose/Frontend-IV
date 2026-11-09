import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Download, CalendarDays, FileText } from "lucide-react";

import { notify } from "@/components/shared/Notify";
import { Guard } from "@/components/shared/Guard";
import { DataTable } from "@/components/shared/Data_table";
import { Button } from "@/components/ui/button";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { SkeletonTableFilter } from "@/components/shared/SkeletonTableFilter";
import { useAuth } from "@/context/AuthContext";
// API & Definiciones
import { getAllPers, deletePer, exportarPersPdf } from "@/services/perService";
import { columnsPer } from "./columnsPer";
// Modales
import CreatePerModal from "./CreatePerModal";
import EditPerModal from "./EditPerModal";
import { getDocentes } from "@/services/perService";
import GenericShowModal from "@/components/shared/GenericShowModal";
import { getEstudiantes } from "@/services/censoService";
import { perSections } from "./perSections";

export default function Per() {
  const { lapsoActual } = useAuth();

  // Estados principales de datos y carga
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [docentes, setDocentes] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);

  // Estado para el ID del registro a editar (igual que en Docentes.jsx)
  const [editingPerId, setEditingPerId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Estados para el Modal de Detalles Generico (GenericShowModal)
  const [selectedPer, setSelectedPer] = useState(null);
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);

  // Carga de datos unificada
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};

      if (lapsoActual?.id) {
        params.lapso_id = lapsoActual.id;
      }

      const res = await getAllPers(params);
      const resultData = res || [];
      setData(resultData);
    } catch (error) {
      console.error("Error al obtener registros PER:", error);
      notify.error("Error al cargar los datos del PER.");
    } finally {
      setLoading(false);
    }
  }, [lapsoActual]);

  // Llamada inicial para obtener los datos del PER
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // obtener Doocentes para impartir el Per
  const fetchDocentes = async () => {
    try {
      const res = await getDocentes();
      const resultData = res?.data || res || [];
      setDocentes(resultData);
    } catch (error) {
      console.error("Error al obtener docentes:", error);
      notify.error("Error al obtener los docentes.");
    }
  };

  const fetchEstudiantes = async () => {
    try {
      const res = await getEstudiantes();
      const resultData = res || [];
      setEstudiantes(resultData);
    } catch (error) {
      console.error("Error al obtener estudiantes:", error);
    }
  };

  // Llamada inicial para obtener los docentes y estudiantes
  useEffect(() => {
    fetchDocentes();
    fetchEstudiantes();
  }, []);

  // Handler para Abrir Modal de Detalles
  const handleShowDetails = useCallback((item) => {
    setSelectedPer(item);
    setIsShowModalOpen(true);
  }, []);

  //  Handler para Editar (se pasa el ID al estado)
  const handleEdit = useCallback((item) => {
    setEditingPerId(item.id);
  }, []);

  const handleDelete = useCallback((item) => {
    setDeletingId(item.id);
  }, []);

  // Columnas memorizadas
  const columns = useMemo(() => {
    return columnsPer(handleShowDetails, handleEdit, handleDelete);
  }, [handleShowDetails, handleEdit, handleDelete]);

  // Manejo de exportación de reporte
  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);

      await notify.promise(
        (async () => {
          const params = {};
          if (lapsoActual?.id) params.lapso_id = lapsoActual.id;

          const blobData = await exportarPersPdf(params);
          const url = window.URL.createObjectURL(
            new Blob([blobData], { type: "application/pdf" }),
          );
          const link = document.createElement("a");
          link.href = url;
          const fechaActual = new Date().toISOString().slice(0, 10);
          link.setAttribute("download", `Reporte_PER_${fechaActual}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.parentNode?.removeChild(link);
          window.URL.revokeObjectURL(url);
        })(),
        {
          loading: "Generando reporte de PER en PDF...",
          success: "Reporte PDF descargado con éxito",
          error: "No se pudo procesar el archivo PDF",
        },
      );
    } catch (error) {
      console.error("Error exportando reporte PDF:", error);
    } finally {
      setExportingPdf(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "PER", href: "/per" },
  ];

  if (loading) {
    return <SkeletonTableFilter />;
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <h1 className="capitalize font-semibold text-3xl font-sans mb-4">
        Gestión del PER
      </h1>

      <div className="flex flex-col gap-4 mb-2 md:flex-row md:items-center md:justify-between">
        <BreadcrumbReusable items={breadcrumbItems} />

        <div className="flex items-center gap-4">
          {/* Badge de Lapso Activo */}
          {lapsoActual && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl dark:bg-slate-900/60 dark:border-slate-800">
              <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 capitalize">
                Lapso Activo: {lapsoActual.nombre_lapso}
              </span>
            </div>
          )}

          {/* Botón Exportar PDF */}
          <Button
            variant="outline"
            className="flex items-center gap-2 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:hover:bg-slate-800"
            disabled={exportingPdf}
            onClick={handleExportPdf}
          >
            {exportingPdf ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            ) : (
              <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className="hidden sm:inline">
              {exportingPdf ? "Procesando..." : "Descargar Reporte"}
            </span>
          </Button>

          {/* Botón Abrir Modal de Creación */}
          {/* <Guard requiredPermissions="per.crear"> */}
          <div className="flex justify-end">
            <CreatePerModal
              fetData={fetchData}
              Docentes={docentes}
              Estudiantes={estudiantes}
            />
          </div>

          {/* </Guard> */}
        </div>
      </div>

      {/* Tabla de Datos Principal */}
      <div className="my-5">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          filterColumn="estudiante"
        />
      </div>

      {/*  Modal para Editar Registro PER */}
      <EditPerModal
        isOpen={!!editingPerId}
        perId={editingPerId}
        onClose={() => setEditingPerId(null)}
        onSuccess={fetchData}
        Docentes={docentes}
        Estudiantes={estudiantes}
      />

      {/* Modal Genérico para Ver Detalles del PER */}
      <GenericShowModal
        isOpen={isShowModalOpen}
        onClose={() => setIsShowModalOpen(false)}
        title="Ficha Detallada del PER"
        description={
          selectedPer
            ? `Estudiante: ${selectedPer.estudiante?.persona?.nombre || ""} ${selectedPer.estudiante?.persona?.apellido || ""} - C.I: ${selectedPer.estudiante?.persona?.cedula_persona || ""}`
            : ""
        }
        icon={FileText}
        data={selectedPer}
        sections={perSections}
      />

      {/* Modal para Confirmación de Eliminación */}
      <AlertDialogDestructive
        isOpen={!!deletingId}
        id={deletingId}
        onClose={() => setDeletingId(null)}
        onSuccess={fetchData}
        deleteFunction={deletePer}
      />
    </div>
  );
}
