import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import React, { useEffect, useState, useCallback } from "react";
import { columns } from "./columnsSeccion";
import { DataTable } from "@/components/shared/Data_table";
import { deleteSeccion, getAllSecciones, getDataSelectSeccion, generarReporteSecciones, getPnfBySede } from "@/services/seccionService";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { notify } from "@/components/shared/Notify";
import CreateSeccioneModal from "./CreateSeccioneModal";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { useFormik } from "formik";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SelectSearch from "@/components/shared/SelectSearch";
import { Guard } from "@/components/shared/Guard";
import GenericShowModal from "@/components/shared/GenericShowModal";
import { seccionSections } from "./seccionSections";
import { BookOpen, CalendarDays, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function SeccionParametros({ selectData, onFilterChange }) {
  const { pnf, lapsoActual } = useAuth();
  const [pnfs, setPnfs] = useState([]);
  const [loadingPnfs, setLoadingPnfs] = useState(false);

  // ID del PNF del usuario si existe
  const userPnfId = pnf?.id || pnf || "";

  // Función para cargar Pnfs
  const cargarPnfs = async (sedeId) => {
    if (!sedeId) {
      setPnfs([]);
      return;
    }

    setLoadingPnfs(true);
    try {
      const response = await getPnfBySede(sedeId);
      setPnfs(response);
    } catch (error) {
      console.error("Error al cargar Pnfs:", error);
      setPnfs([]);
    } finally {
      setLoadingPnfs(false);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      lapso: lapsoActual?.id || "",
      sede: "",
      pnf: userPnfId, // Si tiene PNF, se preselecciona automáticamente
      trayecto: "",
    },
    onSubmit: () => { },
  });

  // Sincronizar el valor del lapso en el filtro cuando cambia el lapso activo global
  useEffect(() => {
    if (lapsoActual?.id) {
      formik.setFieldValue("lapso", lapsoActual.id);
    }
  }, [lapsoActual?.id]);

  // Asegurar que si existe userPnfId permanezca seteado en Formik
  useEffect(() => {
    if (userPnfId) {
      formik.setFieldValue("pnf", userPnfId);
    }
  }, [userPnfId]);

  // Efecto para cargar Pnfs cuando cambia la sede (Solo si el usuario NO tiene PNF asignado)
  useEffect(() => {
    if (!userPnfId) {
      if (formik.values.sede) {
        cargarPnfs(formik.values.sede);
      } else {
        setPnfs([]);
        formik.setFieldValue("pnf", "");
      }
    }
  }, [formik.values.sede, userPnfId]);

  // Dispara la búsqueda en cada cambio de valor del formulario
  useEffect(() => {
    const cleanFilters = Object.fromEntries(
      Object.entries(formik.values)
        .filter(([, v]) => v !== "" && v !== null && v !== undefined)
    );

    onFilterChange(cleanFilters);
  }, [formik.values, onFilterChange]);

  if (!selectData) return null;

  const hasActiveFilter = Object.entries(formik.values).some(
    ([key, value]) => key !== "pnf" && value !== ""
  );

  return (
    <form onSubmit={formik.handleSubmit} className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl dark:bg-slate-900/40 dark:border-slate-800/60 flex flex-col gap-4 font-sans">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
          Filtrar por:
        </Label>
        {hasActiveFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              formik.resetForm();
              if (lapsoActual?.id) {
                formik.setFieldValue("lapso", lapsoActual.id);
              }
              if (userPnfId) {
                formik.setFieldValue("pnf", userPnfId);
              }
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 h-auto py-1 px-2"
            type="button"
          >
            Limpiar Filtros
          </Button>
        )}
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-2 ${!userPnfId ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4`}>
        {/* Lapso */}
        <div className="space-y-2">
          <Label className="uppercase text-xs font-semibold text-slate-500 dark:text-slate-400">Lapso</Label>
          <SelectSearch
            name="lapso"
            options={selectData?.lapsos || []}
            formik={formik}
            labelKey="nombre_lapso"
            valueKey="id"
            placeholder="Seleccione un Lapso"
          />
        </div>

        {/* Sede */}
        <div className="space-y-2">
          <Label className="uppercase text-xs font-semibold text-slate-500 dark:text-slate-400">Sede</Label>
          <SelectSearch
            name="sede"
            options={selectData?.sedes || []}
            formik={formik}
            labelKey="nombre_sede"
            valueKey="id"
            placeholder="Seleccione una Sede"
          />
        </div>

        {/* PNF: Solo se renderiza si el usuario NO tiene un PNF asignado */}
        {!userPnfId && (
          <div className="space-y-2">
            <Label className="uppercase text-xs font-semibold text-slate-500 dark:text-slate-400">PNF</Label>
            <SelectSearch
              name="pnf"
              options={pnfs || []}
              formik={formik}
              labelKey="nombre"
              valueKey="id"
              placeholder={
                !formik.values.sede
                  ? "Primero seleccione una sede"
                  : loadingPnfs
                    ? "Cargando PNF..."
                    : pnfs?.length === 0
                      ? "No hay PNF"
                      : "Seleccione un PNF"
              }
              disabled={!formik.values.sede || loadingPnfs}
            />
          </div>
        )}

        {/* Trayecto */}
        <div className="space-y-2">
          <Label className="uppercase text-xs font-semibold text-slate-500 dark:text-slate-400">Trayecto</Label>
          <SelectSearch
            name="trayecto"
            options={selectData?.trayectos || []}
            formik={formik}
            labelKey="nombre"
            valueKey="id"
            placeholder="Seleccione un Trayecto"
          />
        </div>
      </div>
    </form>
  );
}

export default function Secciones() {
  const { lapsoActual } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectData, setSelectData] = useState(null);

  // Estados para el Modal de Detalles
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);

  const [filters, setFilters] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerarPDF = async () => {
    setIsGenerating(true);
    try {
      await generarReporteSecciones(filters);
    } catch (error) {
      console.error("Detalles del error al generar reporte:", error);
      notify.error(
        `Error al generar el reporte de secciones. Por favor, inténtalo de nuevo.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchSecciones = async (params = filters) => {
    setLoading(true);
    try {
      const secciones = await getAllSecciones(params);
      setData(secciones);
    } catch (error) {
      console.error("Error fetching secciones:", error);
      notify.error("Error al obtener las secciones. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    fetchSecciones(newFilters);
  }, []);

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const response = await getDataSelectSeccion();
        setSelectData(response);
      } catch (error) {
        console.error("Error al obtener datos select:", error);
      }
    };
    fetchSelectData();
  }, []);

  const handleEdit = () => {
    // Placeholder para edición futura
  };

  const onDelete = (seccion) => {
    setDeletingId(seccion.id);
  };

  const handleShow = (seccion) => {
    setSelectedSeccion(seccion);
    setIsShowModalOpen(true);
  };

  useEffect(() => {
    fetchSecciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = [
    { label: "Home", href: "/" },
    { label: "Secciones", href: "/secciones" },
  ];

  if (initialLoad) {
    return <SkeletonTable />;
  }

  return (
    <div>
      <h1 className="mb-4 font-sans capitalize text-3xl font-semibold">Secciones</h1>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <BreadcrumbReusable items={items} />

        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {lapsoActual && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl dark:bg-slate-900/60 dark:border-slate-800">
              <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 capitalize">
                Lapso Activo: {lapsoActual.nombre_lapso}
              </span>
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleGenerarPDF}
            className="flex items-center gap-2 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:hover:bg-slate-800"
            disabled={isGenerating || loading}
          >
            {isGenerating || loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            ) : (
              <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className="hidden sm:inline">
              {isGenerating || loading ? "Procesando..." : "Descargar Reporte"}
            </span>
          </Button>

          <Guard requiredPermissions="seccion.crear">
            <CreateSeccioneModal
              fetchSecciones={fetchSecciones}
              selectData={selectData}
            />
          </Guard>
        </div>

        <AlertDialogDestructive
          isOpen={!!deletingId}
          id={deletingId}
          onClose={() => setDeletingId(null)}
          onSuccess={() => fetchSecciones(filters)}
          deleteFunction={deleteSeccion}
        />

        {/* Modal Reutilizable de Ver Detalles */}
        <GenericShowModal
          isOpen={isShowModalOpen}
          onClose={() => setIsShowModalOpen(false)}
          title="Detalles de la Sección"
          description={
            selectedSeccion
              ? `${selectedSeccion.nombre || ""} - ${selectedSeccion.pnf?.nombre || ""}`
              : ""
          }
          icon={BookOpen}
          data={selectedSeccion}
          sections={seccionSections}
        />
      </div>

      <SeccionParametros selectData={selectData} onFilterChange={handleFilterChange} />

      <div className="my-4">
        <DataTable
          columns={columns(handleEdit, onDelete, handleShow)}
          data={data}
          filterColumn="nombre"
        />
      </div>
    </div>
  );
}