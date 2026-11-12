import { notify } from "@/components/shared/Notify";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { deletePnf, exportarPnfsPdf, getAllPnfs } from "@/services/pnfService";
import React, { useEffect, useState } from "react";
import { columnsPnfs } from "./columnsPnfs";
import { DataTable } from "@/components/shared/Data_table";
import CreatePnfModal from "./CreatePnfModal";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import EditPnfModal from "./EditPnfModal";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { getAllTrayectos } from "@/services/trayectoService";
import { Guard } from "@/components/shared/Guard";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Pnfs() {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPnfId, setEditingPnfId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [trayectos, setTrayectos] = useState([]);
  const [descargandoPdf, setDescargandoPdf] = useState(false);

  const fetchPnfs = async () => {
    try {
      const pnfs = await getAllPnfs();
      setData(pnfs);
    } catch (error) {
      console.error("Error fetching pnfs:", error);
      notify.error(
        "Error al obtener los pnfs. Por favor, inténtalo de nuevo.",
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

  // Exportar reporte de PNF a Pdf
  const handleDescargarPdf = async () => {
    try {
      setDescargandoPdf(true);

      await notify.promise(
        (async () => {
          const blobData = await exportarPnfsPdf();
          const url = window.URL.createObjectURL(new Blob([blobData]));
          const link = document.createElement("a");
          link.href = url;
          const fecha = new Date().toISOString().slice(0, 10);
          link.setAttribute("download", `REPORTE_PNFS_${fecha}.pdf`);
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
    { label: "Pnfs", href: "/pnfs" },
  ];

  if (loading) {
    return <SkeletonTable />;
  }

  return (
    <div>
      <h1 className="mb-4 font-sans capitalize text-3xl font-semibold">Pnfs</h1>
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

          <Guard requiredPermissions="pnf.crear">
            <div className="flex justify-end">
              <CreatePnfModal fetchPnfs={fetchPnfs} trayectos={trayectos} />
            </div>
          </Guard>
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
