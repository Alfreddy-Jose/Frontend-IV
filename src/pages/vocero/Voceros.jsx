import React, { useEffect, useState, useMemo } from "react";
import { useFormik } from "formik";
import { notify } from "@/components/shared/Notify";
import {
  getAllVoceros,
  deleteVocero,
  exportarVocerosPdf,
} from "@/services/voceroService";
import { getEstudiantes } from "@/services/censoService";
import { getSeccionesByPnf } from "@/services/personaService";
import { DataTable } from "@/components/shared/Data_table";
import CreateVoceroModal from "./CreateVoceroModal";
import GenericShowModal from "@/components/shared/GenericShowModal";
import { voceroSections } from "./voceroSections";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { useAuth } from "@/context/AuthContext";
import SelectSearch from "@/components/shared/SelectSearch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import MetricCarousel from "@/components/shared/MetricCarousel";
import { CalendarDays, Download, ChevronDown, Megaphone } from "lucide-react";
import { columnsVocero } from "./columnsVocero";
import { SkeletonTableFilter } from "@/components/shared/SkeletonTableFilter";

export default function Voceros() {
  const { pnf, lapsoActual, user } = useAuth();

  // Estados de datos
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [secciones, setSecciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loadingCatalogosForm, setLoadingCatalogosForm] = useState(false);

  // Estados de interfaz y filtrado
  const [filtroRapido, setFiltroRapido] = useState("todos");

  // Estados para modales de acción por fila
  const [selectedVoceroDetails, setSelectedVoceroDetails] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [descargandoPdf, setDescargandoPdf] = useState(false);

  // Formik para el filtro por Sección
  const filterFormik = useFormik({
    initialValues: {
      seccion_id: "",
    },
  });

  // Carga de Voceros según el lapso actual
  const fetchVoceros = async () => {
    try {
      setLoading(true);

      const params = {};
      if (lapsoActual?.id) {
        params.lapso_id = lapsoActual.id;
      }

      const res = await getAllVoceros(params);

      // 🔹 Si la API devuelve { data: [...] }, extraemos res.data, de lo contrario usamos res directamente.
      // Además nos aseguramos de que siempre termine siendo un Array con Array.isArray()
      const list = Array.isArray(res) ? res : res?.data || [];

      setData(list);
    } catch (error) {
      console.error("Error fetching voceros:", error);
      notify.error("Error al obtener la lista de voceros.");
      setData([]); // Para evitar fallos en renderizado si hay error
    } finally {
      setLoading(false);
    }
  };

  // Carga de catálogos necesarios para modales y selectores
  const fetchCatalogosFormularios = async () => {
    try {
      setLoadingCatalogosForm(true);
      const [estudiantesData] = await Promise.all([getEstudiantes()]);
      setEstudiantes(estudiantesData || []);
    } catch (error) {
      console.error("Error al cargar los catálogos del formulario:", error);
      notify.error("Error al cargar la lista de estudiantes.");
    } finally {
      setLoadingCatalogosForm(false);
    }
  };

  // Cargar Catálogos Iniciales al cambiar PNF o Lapso
  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [seccionesData] = await Promise.all([
          getSeccionesByPnf(pnf ? pnf : null),
        ]);
        setSecciones(seccionesData || []);
      } catch (error) {
        console.error("Error al obtener secciones para filtros:", error);
      }
    };

    fetchCatalogos();
    fetchCatalogosFormularios();
    fetchVoceros();
  }, [pnf, lapsoActual]);

  // Handlers de acciones pasados a la columna de la tabla
  const handleViewDetails = (vocero) => {
    setSelectedVoceroDetails(vocero);
  };

  const handleDelete = (vocero) => {
    setDeletingId(vocero.id);
  };

  const items = [
    { label: "Home", href: "/" },
    { label: "Voceros", href: "/voceros" },
  ];

  // 1. Cálculo de Métricas Rápidas
  const {
    countTotal,
    countPrincipales,
    countSuplentes,
  } = useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];

    return {
      countTotal: safeData.length,
      countPrincipales: safeData.filter(
        (item) => item.tipo_vocero === "PRINCIPAL",
      ).length,
      countSuplentes: safeData.filter((item) => item.tipo_vocero === "SUPLENTE")
        .length,
    };
  }, [data]);

  // 2. Filtrado local en memoria por métrica rápida y por sección (DEJAR SOLO ESTE)
  const filteredData = useMemo(() => {
    let result = Array.isArray(data) ? [...data] : [];

    if (filtroRapido && filtroRapido !== "todos") {
      result = result.filter((item) => item?.tipo_vocero === filtroRapido);
    }

    const targetSeccion = filterFormik.values.seccion_id;
    if (targetSeccion) {
      result = result.filter(
        (item) => String(item?.seccion_id) === String(targetSeccion),
      );
    }

    return result;
  }, [data, filtroRapido, filterFormik.values.seccion_id]);

  // 3. Configuración del MetricCarousel
  const carouselItems = [
    { label: "Total Voceros", value: "todos", count: countTotal },
    { label: "Principales", value: "PRINCIPAL", count: countPrincipales },
    { label: "Suplentes", value: "SUPLENTE", count: countSuplentes },
  ];

  // Exportar reporte PDF respetando los filtros activos
  const handleDescargarPdf = async () => {
    if (!lapsoActual?.id) {
      notify.error(
        "Se requiere un lapso académico activo para generar el reporte.",
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
            params.tipo_vocero = filtroRapido;
          }

          const seccionId = filterFormik.values.seccion_id;
          if (seccionId) {
            params.seccion_id = seccionId;
          }

          const blobData = await exportarVocerosPdf(params);
          const url = window.URL.createObjectURL(new Blob([blobData]));
          const link = document.createElement("a");
          link.href = url;

          let seccionNombre = "GENERAL";
          if (seccionId) {
            const seccionEncontrada = secciones.find(
              (s) => String(s.id) === String(seccionId),
            );
            seccionNombre = seccionEncontrada
              ? seccionEncontrada.nombre
              : seccionId;
          }

          const lapsoLimpio = String(
            lapsoActual.nombre_lapso || "2026",
          ).replace("-", "_");
          const pnfLimpio = user?.pnf?.abreviado ? user.pnf.abreviado : "";

          const nombreArchivo = `VOCEROS_${seccionNombre}_${lapsoLimpio}_${pnfLimpio}.pdf`;

          link.setAttribute("download", nombreArchivo);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(url);
        })(),
        {
          loading: "Generando reporte de Voceros...",
          success: "Reporte PDF descargado con éxito.",
          error: "No se pudo procesar el archivo PDF.",
        },
      );
    } catch (error) {
      console.error("Error al descargar reporte:", error);
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
        Voceros
      </h1>

      <div className="flex flex-col gap-4 mb-2 md:flex-row md:items-center md:justify-between">
        <BreadcrumbReusable items={items} />

        {/* Lapso Actual */}
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

          {/* Modal para Designar Vocero */}
          {lapsoActual ? (
            <CreateVoceroModal
              fetchVoceros={fetchVoceros}
              estudiantes={estudiantes}
              listaSecciones={secciones}
              loadingEstudiantes={loadingCatalogosForm}
            />
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

      {/* Sección de Filtros Avanzados */}
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl dark:bg-slate-900/40 dark:border-slate-800/60 flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-80 flex flex-col gap-1.5">
          <Label
            htmlFor="seccion_id"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase"
          >
            Filtrar por Sección
          </Label>
          <SelectSearch
            placeholder="Todas las Secciones"
            name="seccion_id"
            options={secciones}
            labelKey="nombre"
            valueKey="id"
            formik={filterFormik}
          />
        </div>
        {filterFormik.values.seccion_id && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => filterFormik.setFieldValue("seccion_id", "")}
            className="text-xs self-end mt-1 text-indigo-600 dark:text-indigo-400"
          >
            Limpiar Filtro
          </Button>
        )}
      </div>

      {/* Tabla de Datos */}
      <div className="my-5">
        <DataTable
          columns={columnsVocero(handleViewDetails, handleDelete)}
          data={filteredData}
          filterColumn="nombre"
        />
      </div>

      {/* Modal para Eliminar/Desvincular */}
      <AlertDialogDestructive
        isOpen={!!deletingId}
        id={deletingId}
        onClose={() => setDeletingId(null)}
        onSuccess={fetchVoceros}
        deleteFunction={deleteVocero}
      />

      {/* Modal para Ver Detalles del Vocero */}
      <GenericShowModal
        isOpen={!!selectedVoceroDetails}
        onClose={() => setSelectedVoceroDetails(null)}
        title="Ficha Detallada del Vocero"
        description={
          selectedVoceroDetails
            ? `Estudiante: ${selectedVoceroDetails.estudiante?.persona?.nombre || ""} ${selectedVoceroDetails.estudiante?.persona?.apellido || ""} - C.I: ${selectedVoceroDetails.estudiante?.persona?.cedula_persona || ""}`
            : ""
        }
        icon={Megaphone}
        data={selectedVoceroDetails}
        sections={voceroSections}
      />
    </div>
  );
}
