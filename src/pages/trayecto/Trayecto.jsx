import BreadcrumbReusable from '@/components/shared/BreadcrumbReusable';
import { DataTable } from '@/components/shared/Data_table';
import { notify } from '@/components/shared/Notify';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { deleteTrayecto, exportarTrayectosPdf, getAllTrayectos } from '@/services/trayectoService';
import React, { useEffect, useState } from 'react'
import { columnsTrayecto } from './columnsTrayecto';
import CreateTrayectoMoldal from './CreateTrayectoMoldal';
import { AlertDialogDestructive } from '@/components/shared/AlertDialogDestructive';
import { Guard } from '@/components/shared/Guard';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function Trayecto() {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [descargandoPdf, setDescargandoPdf] = useState(false);

  const fetchTrayecto = async () => {
    try {
      const trayecto = await getAllTrayectos();
      setData(trayecto); 
    } catch (error) {
      console.error("Error fetching trayecto:", error);
      notify.error(
        "Error al obtener los trayectos. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (trayecto) => {
    setDeletingId(trayecto.id);
  };

  useEffect(() => {
    fetchTrayecto();
  }, []);

  // Exportar reporte de trayectos a Pdf
  const handleDescargarPdf = async () => {
    try {
      setDescargandoPdf(true);

      await notify.promise(
        (async () => {
          const blobData = await exportarTrayectosPdf();
          const url = window.URL.createObjectURL(new Blob([blobData]));
          const link = document.createElement("a");
          link.href = url;
          const fecha = new Date().toISOString().slice(0, 10);
          link.setAttribute("download", `REPORTE_TRAYECTOS_${fecha}.pdf`);
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
    { label: "Trayectos", href: "/trayectos" },
  ];

  if (loading) {
    return <SkeletonTable />;
  }

  return (
    <div>
      <h1 className="mb-4 font-sans text-3xl capitalize font-semibold">Trayectos</h1>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb para la Navegación  */}
        <BreadcrumbReusable items={items} />

        {/* Botón de reporte + boton de agregar PNF al lado derecho */}
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

          <Guard requiredPermissions="trayecto.crear">
            <div className="flex justify-end">
              <CreateTrayectoMoldal fetchTrayecto={fetchTrayecto} />
            </div>
          </Guard>
        </div>

        {/* modal para Eliminar */}
        <AlertDialogDestructive
          isOpen={!!deletingId}
          id={deletingId}
          onClose={() => setDeletingId(null)}
          onSuccess={fetchTrayecto}
          deleteFunction={deleteTrayecto}
        />
      </div>
      
      <div className="my-4">
        {/* Tabla de Trayectos */}
        <DataTable
          columns={columnsTrayecto(handleDelete)}
          data={data}
          filterColumn="nombre"
        />
      </div>
    </div>
  );
}
