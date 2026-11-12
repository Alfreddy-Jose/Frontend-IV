import { AlertDialogDestructive } from '@/components/shared/AlertDialogDestructive';
import BreadcrumbReusable from '@/components/shared/BreadcrumbReusable';
import { notify } from '@/components/shared/Notify';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { deleteDocente, exportarDocentesPdf, getAllDocentes, getDataSelect } from '@/services/docenteService';
import React, { useEffect, useState } from 'react'
import { columnsDocente } from './columnsDocente';
import { DataTable } from '@/components/shared/Data_table';
import CreateDocenteModal from './CreateDocenteModal';
import EditDocenteModal from './EditDocenteModal';
import { Guard } from '@/components/shared/Guard';
import GenericShowModal from '@/components/shared/GenericShowModal';
import { GraduationCap, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { docenteSections } from './docenteSections';

export default function Docentes() {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDocenteId, setEditingDocenteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [dataSelect, setDataSelect] = useState([]);
  const [descargandoPdf, setDescargandoPdf] = useState(false);

  // Estados para el Modal de Detalles
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);

  // Fetch para traer lo Docentes
  const fetchDocentes = async () => {
    try {
      const docentes = await getAllDocentes();
      setData(docentes);
    } catch (error) {
      console.error("Error fetching docentes:", error);
      notify.error(
        "Error al obtener los docentes. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  // fetch para traer datos para crear docente
  useEffect(() => {
    const fetchDataSelect = async () => {
      try {
        const dataSelectDocente = await getDataSelect();
        setDataSelect(dataSelectDocente);
      } catch (error) {
        console.error("Error al obtener los Datos:", error);
        setDataSelect([]);
      }
    };

    fetchDataSelect();
  }, []);

  const handleEdit = (docente) => {
    setEditingDocenteId(docente.id);
  };

  const handleDelete = (docente) => {
    setDeletingId(docente.id);
  };

  // Handler para Abrir Modal de Detalles
  const handleShow = (docente) => {
    setSelectedDocente(docente);
    setIsShowModalOpen(true);
  };

  // Exportar reporte de docentes a Pdf
  const handleDescargarPdf = async () => {
    try {
      setDescargandoPdf(true);

      await notify.promise(
        (async () => {
          const blobData = await exportarDocentesPdf();
          const url = window.URL.createObjectURL(new Blob([blobData]));
          const link = document.createElement("a");
          link.href = url;
          const fecha = new Date().toISOString().slice(0, 10);
          link.setAttribute("download", `REPORTE_DOCENTES_${fecha}.pdf`);
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

  useEffect(() => {
    fetchDocentes();
  }, []);

  const items = [
    { label: "Home", href: "/" },
    { label: "Docentes", href: "/docentes" },
  ];

  if (loading) {
    return <SkeletonTable />;
  }

  return (
    <div>
      <h1 className="mb-4 font-sans capitalize text-3xl font-semibold">Docentes</h1>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb para la Navegación  */}
        <BreadcrumbReusable items={items} />

        {/* Botón de reporte + boton para agregar Docente */}
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

          <Guard requiredPermissions="docente.crear">
            <div className="flex justify-end">
              <CreateDocenteModal fetchDocente={fetchDocentes} dataSelect={dataSelect} />
            </div>
          </Guard>
        </div>
 
        {/* modal para Editar */}
        <EditDocenteModal
          isOpen={!!editingDocenteId}
          docenteId={editingDocenteId}
          onClose={() => setEditingDocenteId(null)}
          onSuccess={fetchDocentes}
          dataSelect={dataSelect}
        />

        {/* modal para Eliminar */}
        <AlertDialogDestructive 
          isOpen={!!deletingId}
          id={deletingId}
          onClose={() => setDeletingId(null)}
          onSuccess={fetchDocentes}
          deleteFunction={deleteDocente}
        />

        {/* Modal para Ver Detalles */}
        <GenericShowModal
          isOpen={isShowModalOpen}
          onClose={() => setIsShowModalOpen(false)}
          title="Ficha del Docente"
          description={
            selectedDocente
              ? `${selectedDocente.persona?.nombre || ""} ${selectedDocente.persona?.apellido || ""} - C.I: ${selectedDocente.persona?.cedula_persona || ""}`
              : ""
          }
          icon={GraduationCap}
          data={selectedDocente}
          sections={docenteSections}
        />
      </div>
      <div className="my-4">
        {/* Tabla de Docentes */}
        <DataTable
          columns={columnsDocente(handleEdit, handleDelete, handleShow)}
          data={data}
          filterColumn="nombre"
        />
      </div>
    </div>
  );
}
