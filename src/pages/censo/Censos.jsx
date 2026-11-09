import React, { useEffect, useState, useMemo } from "react";
import { useFormik } from "formik";
import { notify } from "@/components/shared/Notify";
import {
  getAllCensos,
  deleteCenso,
  getEstudiantes,
  exportarCensosExcel,
} from "@/services/censoService";
import { getPnfs } from "@/services/sedeService";
import { getSeccionesByPnf } from "@/services/personaService";
import { getAllUnidadesCurriculares } from "@/services/unidadCurricularService";
import { DataTable } from "@/components/shared/Data_table";
import CreateCensoModal from "./CreateCensoModal";
import EditCensoModal from "./EditCensoModal";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { Guard } from "@/components/shared/Guard";
import { useAuth } from "@/context/AuthContext";
import SelectSearch from "@/components/shared/SelectSearch";
import { Label } from "@/components/ui/label";
import ShowCensoModal from "./ShowCensoModal";
import { Button } from "@/components/ui/button"; 
import MetricCarousel from "@/components/shared/MetricCarousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, Download, ChevronDown} from "lucide-react";
import { columnsCenso } from "./columnsCenso";
import { SkeletonTableFilter } from "@/components/shared/SkeletonTableFilter";

export default function Censos() {
  const { pnf, lapsoActual, user } = useAuth();

  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [secciones, setSecciones] = useState([]);
  const [unidadesCurriculares, setUnidadesCurriculares] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [pnfs, setPnfs] = useState([]);
  const [loadingCatalogosForm, setLoadingCatalogosForm] = useState(false);

  // Estados de interfaz y filtrado
  const [filtroRapido, setFiltroRapido] = useState("todos");

  // Estados para modales de fila
  const [selectedCensoDetails, setSelectedCensoDetails] = useState(null); // Controla ver detalles
  const [editingCensoId, setEditingCensoId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [descargandoExcel, setDescargandoExcel] = useState(false);

  // Formik para el filtro de Sección
  const filterFormik = useFormik({
    initialValues: {
      seccion_id: "",
    },
  });

  const fetchCensos = async () => {
    try {
      setLoading(true);

      // Creamos el objeto de parámetros dinámicamente
      const params = {};
      if (lapsoActual?.id) {
        params.lapso_id = lapsoActual.id; // Se enviará como ?lapso_id=...
      }

      // Pasamos el objeto de parámetros al servicio
      const res = await getAllCensos(params);
      setData(res || []);
      console.log("Censos cargados para el lapso:", lapsoActual?.nombre_lapso, res);
    } catch (error) {
      console.error("Error fetching censos:", error);
      notify.error("Error al obtener los censos.");
    } finally {
      setLoading(false);
    }
  };

  // Handlers de acción pasados al DropdownMenu
  const handleViewDetails = (censo) => {
    setSelectedCensoDetails(censo); // Abre el modal de visualización
  };

  const handleEdit = (censo) => {
    setEditingCensoId(censo.id);
  };

  const handleDelete = (censo) => {
    setDeletingId(censo.id);
  };

  const fetchCatalogosFormularios = async () => {
    try {
      setLoadingCatalogosForm(true);
      const [estudiantesData, ucsData, pnfsData] = await Promise.all([
        getEstudiantes(),
        getAllUnidadesCurriculares(),
        getPnfs(),
      ]);
      setEstudiantes(estudiantesData || []);
      setUnidadesCurriculares(ucsData || []);
      setPnfs(pnfsData || []);
    } catch (error) {
      console.error("Error al cargar los catálogos de formularios:", error);
      notify.error("Error al cargar estudiantes y unidades curriculares.");
    } finally {
      setLoadingCatalogosForm(false);
    }
  };

  // Cargar Catálogos Iniciales
  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [seccionesData] = await Promise.all([
          getSeccionesByPnf(pnf ? pnf : null),
        ]);
        setSecciones(seccionesData || []);
      } catch (error) {
        console.error("Error al obtener catálogos para filtros:", error);
      }
    };
    fetchCatalogos();
    fetchCatalogosFormularios();
    fetchCensos();
  }, [pnf, lapsoActual]);

  const items = [
    { label: "Home", href: "/" },
    { label: "Censo Estudiantil", href: "/censos" },
  ];

  // Cálculo de Métricas Rápidas (El que ya modificamos antes)
  const {
    countTotal,
    countDeportistas,
    countEmbarazadas,
    countDiscapacidades,
    countMusicos,
    countAcademico,
  } = useMemo(() => {
    return {
      countTotal: data.length,
      countDeportistas: data.filter(
        (item) => item.detalles?.categoria === "DEPORTISTA",
      ).length,
      countEmbarazadas: data.filter(
        (item) => item.detalles?.categoria === "EMBARAZADA",
      ).length,
      countDiscapacidades: data.filter(
        (item) => item.detalles?.categoria === "DISCAPACIDAD",
      ).length,
      countMusicos: data.filter(
        (item) => item.detalles?.musico === true || item.detalles?.categoria === "MUSICO"
      ).length,
      countAcademico: data.filter((item) => item.tipo_censo === "ACADEMICO").length,
    };
  }, [data]);

  // Arreglo de configuración para el componente reutilizable
  const carouselItems = [
    { label: "Total Censados", value: "todos", count: countTotal },
    { label: "Deportistas", value: "deportista", count: countDeportistas },
    { label: "Embarazadas", value: "embarazada", count: countEmbarazadas },
    { label: "Discapacidades", value: "discapacidad", count: countDiscapacidades },
    { label: "Músicos y Coristas", value: "musico", count: countMusicos },
    { label: "Trámites Académicos", value: "academico", count: countAcademico },
  ];

  // Filtrado local de datos
  const filteredData = useMemo(() => {
    let result = [...data];

    // 1. Aplicamos Filtro Rápido (Carrusel Superior) sin interrumpir el flujo
    if (filtroRapido && filtroRapido !== "todos") {
      if (filtroRapido === "deportista") {
        result = result.filter((item) => item.detalles?.categoria === "DEPORTISTA");
      } else if (filtroRapido === "embarazada") {
        result = result.filter((item) => item.detalles?.categoria === "EMBARAZADA");
      } else if (filtroRapido === "discapacidad") {
        result = result.filter((item) => item.detalles?.categoria === "DISCAPACIDAD");
      } else if (filtroRapido === "musico") {
        result = result.filter((item) => item.detalles?.musico === true || item.detalles?.categoria === "MUSICO");
      } else if (filtroRapido === "cuidado_especial") {
        result = result.filter((item) => item.detalles?.discapacidad === true && item.detalles?.cuidado_especial);
      } else if (filtroRapido === "academico") {
        result = result.filter((item) => item.tipo_censo === "ACADEMICO");
      }
    }

    // 2. Aplicamos Filtro por sección de manera consecutiva
    const targetSeccion = filterFormik.values.seccion_id;
    if (targetSeccion) {
      result = result.filter((item) => {
        const seccionId =
          item.estudiante?.estudiante?.secciones?.[0]?.id ||
          item.estudiante?.secciones?.[0]?.id;
        return String(seccionId) === String(targetSeccion);
      });
    }

    return result;
  }, [data, filtroRapido, filterFormik.values.seccion_id]);

  const handleDescargarExcel = async (tipoCenso) => {
    if (!lapsoActual?.id) {
      notify.error("Se requiere un lapso académico activo para generar el reporte");
      return;
    }

    try {
      setDescargandoExcel(true);

      await notify.promise(
        (async () => {
          const params = {
            lapso_id: lapsoActual.id,
            tipo_censo: tipoCenso // 'POLITICAS ESTUDIANTILES' o 'ACADEMICO'
          };

          if (
            tipoCenso === "POLITICAS ESTUDIANTILES" &&
            filtroRapido &&
            filtroRapido !== "todos" &&
            filtroRapido !== "academico"
          ) {
            params.categoria = filtroRapido;
          }

          // Detectamos si hay sección seleccionada
          const seccionId = filterFormik.values.seccion_id;
          if (seccionId) {
            params.seccion_id = seccionId;
          }

          const blobData = await exportarCensosExcel(params);
          const url = window.URL.createObjectURL(new Blob([blobData]));
          const link = document.createElement("a");
          link.href = url;

          // === AQUÍ ESTÁ EL CAMBIO DEL NOMBRE DINÁMICO ===
          // 1. Buscamos el código/nombre real de la sección en el estado 'secciones'
          let seccionNombre = "GENERAL";
          if (seccionId) {
            const seccionEncontrada = secciones.find(s => String(s.id) === String(seccionId));
            seccionNombre = seccionEncontrada ? seccionEncontrada.nombre : seccionId;
          }

          // 2. Limpiar el lapso académico (Ej: 2026-4 -> 2026_4)
          const lapsoLimpio = String(lapsoActual.nombre_lapso || "2026").replace("-", "_");

          // 3. Traemos el PNF abreviado directo del objeto de desestructuración de useAuth()
          const pnfLimpio = user?.pnf?.abreviado ? user.pnf.abreviado : "";

          // Estructura exacta solicitada: CENSO_SECCION_LAPSO_PNF.xlsx
          const nombreArchivo = `CENSO_${seccionNombre}_${lapsoLimpio}_${pnfLimpio}.xlsx`;
          // ===============================================

          link.setAttribute("download", nombreArchivo);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        })(),
        {
          loading: `Generando reporte de ${tipoCenso === 'ACADEMICO' ? 'Trámites Académicos' : 'Políticas Estudiantiles'}...`,
          success: "Reporte Excel descargado con éxito",
          error: "No se pudo procesar el archivo Excel"
        }
      );

    } catch (error) {
      console.error("Error al descargar reporte:", error);
    } finally {
      setDescargandoExcel(false);
    }
  };

  if (loading) {
    return <SkeletonTableFilter />;
  }

  return (
    <div className="space-y-6">
      <h1 className="capitalize font-semibold text-3xl font-sans mb-4">
        Censo Estudiantil
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

          {/* 🔹 BOTÓN DESPLEGABLE DE DESCARGAR REPORTE */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:hover:bg-slate-800"
                disabled={descargandoExcel}
              >
                {descargandoExcel ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                ) : (
                  <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="hidden sm:inline">
                  {descargandoExcel ? "Procesando..." : "Descargar Reporte"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1">
              <DropdownMenuItem
                onClick={() => handleDescargarExcel("POLITICAS ESTUDIANTILES")}
                className="cursor-pointer rounded-lg text-xs font-medium py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Políticas Estudiantiles
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDescargarExcel("ACADEMICO")}
                className="cursor-pointer rounded-lg text-xs font-medium py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Censo Académico
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {lapsoActual ? (
            <Guard requiredPermissions="censo.crear">
              <CreateCensoModal
                fetchCensos={fetchCensos}
                estudiantes={estudiantes}
                unidadesCurriculares={unidadesCurriculares}
                listaPnfs={pnfs}
                listaSecciones={secciones}
                loadingEstudiantes={loadingCatalogosForm}
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


      {/* Carrusel de Tarjetas de Métricas Rápidas Reutilizable */}
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
            Filtrar por Sección Procedente
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
          columns={columnsCenso(handleViewDetails, handleEdit, handleDelete)}
          data={filteredData}
          filterColumn="nombre"
        />
      </div>

      {/* MODAL PARA VER DETALLES DEL JSON */}
      <ShowCensoModal
        isOpen={!!selectedCensoDetails}
        censo={selectedCensoDetails}
        listaPnfs={pnfs}
        listaSecciones={secciones}
        onClose={() => setSelectedCensoDetails(null)}
      />

      {/* MODAL PARA EDITAR EL CENSO */}
      <EditCensoModal
        isOpen={!!editingCensoId}
        censoId={editingCensoId}
        onClose={() => setEditingCensoId(null)}
        fetchCensos={fetchCensos}
        estudiantes={estudiantes}
        unidadesCurriculares={unidadesCurriculares}
        listaPnfs={pnfs} // Pasar lista de PNFs
        listaSecciones={secciones} // Pasar lista de Secciones
      />

      {/* Modal para Eliminar */}
      <AlertDialogDestructive
        isOpen={!!deletingId}
        id={deletingId}
        onClose={() => setDeletingId(null)}
        onSuccess={fetchCensos}
        deleteFunction={deleteCenso}
      />
    </div>
  );
}
