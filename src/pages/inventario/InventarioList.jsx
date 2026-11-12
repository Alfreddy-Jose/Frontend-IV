import React, { useEffect, useState, useMemo } from "react";
import { useFormik } from "formik";
import { notify } from "@/components/shared/Notify";
import {
  deleteBien,
  exportarInventarioPdf,
  getAllBienes,
} from "@/services/inventarioService";
import { getPnfs } from "@/services/sedeService";
import { DataTable } from "@/components/shared/Data_table";
import CreateBienModal from "./CreateBienModal";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import MetricCarousel from "@/components/shared/MetricCarousel";
import { CalendarDays, Download } from "lucide-react";
import { columnsInventario } from "./columnsInventario";
import ChangeEstatusModal from "./ChangeEstatusModal";
import { SkeletonTableFilter } from "@/components/shared/SkeletonTableFilter";
import GenericShowModal from "@/components/shared/GenericShowModal";
import { Package } from "lucide-react";
import { getInventarioSections } from "./inventarioSections";
import EditBienModal from "./EditBienModal";
import { Guard } from "@/components/shared/Guard";

export default function Inventario() {
  const { lapsoActual, user, pnf } = useAuth();

  // Estados de datos
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de interfaz y filtrado
  const [filtroRapido, setFiltroRapido] = useState("todos");

  // Estados para modales de acción por fila
  const [selectedBienDetails, setSelectedBienDetails] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [bienToEstatus, setBienToEstatus] = useState(null);
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [pnfs, setPnfs] = useState([]);
  const [isShowOpen, setIsShowOpen] = useState(false);
  const [editingBienId, setEditingBienId] = useState(null);

  // Formik para filtros adicionales (por ejemplo, filtrar por estado operativo en select)
  const filterFormik = useFormik({
    initialValues: {
      estado_operativo: "",
    },
  });

  // Carga de inventario según el lapso o catálogo general
  const fetchInventario = async () => {
    // Si no hay lapso cargado en el contexto, limpiamos la tabla y salimos
    if (!lapsoActual?.id) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getAllBienes(lapsoActual.id);

      // Extrae el array tanto si viene paginado (res.data.data) o plano (res.data / res)
      const list = Array.isArray(res)
        ? res
        : res?.data?.data || res?.data || [];

      setData(list);
    } catch (error) {
      console.error("Error al obtener inventario:", error);
      notify.error("Error al obtener la lista de bienes.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventario();
  }, [lapsoActual?.id]); // Escucha directamente el ID del lapso

      // fetch para traer los PNFS
      useEffect(() => {
          const fetchPnfs = async () => {
              try {
                  const response = await getPnfs();
                  setPnfs(response || []);
              } catch (error) {
                  console.error("Error al obtener los PNFS:", error);
                  setPnfs([]);
              }
          };
          fetchPnfs();
      }, []);

  // Handlers de acciones
  const handleViewDetails = (item) => {
    setSelectedBienDetails(item);
    setIsShowOpen(true);
  };

  const handleDelete = (item) => {
    setDeletingId(item.bien_id || item.id);
  };

  const handleEdit = (item) => {
    setEditingBienId(item.id || item.bien_id);
  };

  const handleChangeEstatus = (item) => {
    setBienToEstatus(item);
  };

  const items = [
    { label: "Home", href: "/" },
    { label: "Inventario de Bienes", href: "/inventario" },
  ];
  // Extrae el estado operativo tolerando la relación ultimo_reporte
  const getEstadoOperativo = (item) => {
    return (
      item?.ultimo_reporte?.estado_operativo ||
      item?.estado_operativo ||
      "operativo" // Si no tiene último reporte registrado, asumimos que está operativo por defecto
    );
  };

  // 1. Cálculo de Métricas Rápidas para el MetricCarousel
  // 1. Cálculo de Métricas Rápidas para el MetricCarousel
  const { countTotal, countOperativos, countDanados, countDesincorporados } =
    useMemo(() => {
      const safeData = Array.isArray(data) ? data : [];

      return {
        countTotal: safeData.length,
        countOperativos: safeData.filter(
          (item) => getEstadoOperativo(item) === "operativo",
        ).length,
        countDanados: safeData.filter(
          (item) => getEstadoOperativo(item) === "dañado",
        ).length,
        countDesincorporados: safeData.filter(
          (item) => getEstadoOperativo(item) === "desincorporado",
        ).length,
      };
    }, [data]);

  // 2. Filtrado local en memoria
  const filteredData = useMemo(() => {
    let result = Array.isArray(data) ? [...data] : [];

    if (filtroRapido && filtroRapido !== "todos") {
      result = result.filter(
        (item) => getEstadoOperativo(item) === filtroRapido,
      );
    }

    const targetEstado = filterFormik.values.estado_operativo;
    if (targetEstado) {
      result = result.filter(
        (item) => String(getEstadoOperativo(item)) === String(targetEstado),
      );
    }

    return result;
  }, [data, filtroRapido, filterFormik.values.estado_operativo]);

  // 3. Configuración de los ítems del MetricCarousel
  const carouselItems = [
    { label: "Total Bienes", value: "todos", count: countTotal },
    { label: "Operativos", value: "operativo", count: countOperativos },
    { label: "Dañados", value: "dañado", count: countDanados },
    {
      label: "Desincorporados",
      value: "desincorporado",
      count: countDesincorporados,
    },
  ];

  // Exportar reporte de inventario a Pdf
  const handleDescargarPdf = async () => {
    if (!lapsoActual?.id) {
      notify.error(
        "Se requiere un lapso académico activo para generar el reporte legal.",
      );
      return;
    }

    try {
      setDescargandoPdf(true);

      await notify.promise(
        (async () => {
          const params = {
            lapso_id: lapsoActual.id,
          };

          if (filtroRapido && filtroRapido !== "todos") {
            params.estado_operativo = filtroRapido;
          }

          const blobData = await exportarInventarioPdf(params);
          const url = window.URL.createObjectURL(new Blob([blobData]));
          const link = document.createElement("a");
          link.href = url;

          const lapsoLimpio = String(
            lapsoActual.nombre_lapso || "2026",
          ).replace("-", "_");
          const pnfLimpio = user?.pnf?.abreviado ? user.pnf.abreviado : "";

          const nombreArchivo = `INVENTARIO_BIENES_${lapsoLimpio}_${pnfLimpio}.pdf`;

          link.setAttribute("download", nombreArchivo);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        })(),
        {
          loading: "Generando reporte de inventario...",
          success: "Reporte PDF descargado con éxito.",
          error: "No se pudo procesar el archivo de inventario.",
        },
      );
    } catch (error) {
      console.error("Error al descargar reporte de inventario:", error);
    } finally {
      setDescargandoPdf(false);
    }
  };


  if (loading) {
    return <SkeletonTableFilter />;
  }

  return (
    <div className="space-y-6">
      <h1 className="capitalize font-semibold text-3xl font-sans mb-4">
        Inventario de Bienes
      </h1>

      <div className="flex flex-col gap-4 mb-2 md:flex-row md:items-center md:justify-between">
        <BreadcrumbReusable items={items} />

        <div className="flex items-center gap-4">
          {lapsoActual && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl dark:bg-slate-900/60 dark:border-slate-800">
              <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 capitalize">
                Lapso Activo: {lapsoActual.nombre_lapso}
              </span>
            </div>
          )}

          {/* Botón Descargar Reporte */}
          <Button
            variant="outline"
            onClick={handleDescargarPdf}
            className="flex items-center gap-2 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:hover:bg-slate-800"
            disabled={descargandoPdf}
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

          {/* Modal para Registrar Bien */}
          {lapsoActual ? (
            <Guard requiredPermissions="inventario.crear">
              <CreateBienModal
                fetchInventario={fetchInventario}
                lapsoActual={lapsoActual}
                pnfs={pnfs}
                pnfId={pnf}
              />
            </Guard>
          ) : (
            <Button
              disabled
              variant="outline"
              className="opacity-50 cursor-not-allowed"
            >
              Requiere Lapso Activo
            </Button>
          )}
        </div>
      </div>

      {/* Carrusel de Tarjetas de Métricas Rápidas */}
      <MetricCarousel
        items={carouselItems}
        activeFilter={filtroRapido}
        onFilterChange={setFiltroRapido}
      />

      {/* Tabla de Datos */}
      <div className="my-5">
        <DataTable
          columns={columnsInventario(
            handleViewDetails,
            handleDelete,
            handleEdit,
            handleChangeEstatus,
          )}
          data={filteredData}
          filterColumn="codigo_uni"
        />
      </div>

      {/* Modal para ver detalles del Bien */}
      <GenericShowModal
        isOpen={isShowOpen}
        onClose={() => setIsShowOpen(false)}
        title="Detalles del Bien / Equipo"
        description={selectedBienDetails ? `${selectedBienDetails.codigo_uni || selectedBienDetails.bien?.codigo_uni || 'S/C'} - ${selectedBienDetails.nombre || selectedBienDetails.bien?.nombre || ''}` : ""}
        icon={Package}
        data={selectedBienDetails}
        sections={getInventarioSections(pnfs)}
      />

      {/* Modal para Eliminar Bien */}
      <AlertDialogDestructive
        isOpen={!!deletingId}
        id={deletingId}
        onClose={() => setDeletingId(null)}
        onSuccess={fetchInventario}
        deleteFunction={deleteBien}
      />

      {/* Modal para Cambiar Estatus del Bien */}
      <ChangeEstatusModal
        isOpen={!!bienToEstatus}
        bien={bienToEstatus}
        lapsoActual={lapsoActual}
        onClose={() => setBienToEstatus(null)}
        onSuccess={fetchInventario}
      />

      {/* Modal para Editar Bien */}
      {editingBienId && (
        <EditBienModal
          isOpen={!!editingBienId}
          bienId={editingBienId}
          lapsoActual={lapsoActual}
          pnfId={pnf}
          pnfs={pnfs}
          onClose={() => setEditingBienId(null)}
          onSuccess={fetchInventario}
        />
      )}

    </div>
  );
}
