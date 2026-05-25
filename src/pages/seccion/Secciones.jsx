import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import React, { useEffect, useState, useCallback } from "react";
import { columns } from "./columnsSeccion";
import { DataTable } from "@/components/shared/Data_table";
import { deleteSeccion, getAllSecciones, getDataSelectSeccion, generarReporteSecciones } from "@/services/seccionService";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { notify } from "@/components/shared/Notify";
import CreateSeccioneModal from "./CreateSeccioneModal";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { useFormik } from "formik";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SelectSearch from "@/components/shared/SelectSearch";
import { Guard } from "@/components/shared/Guard";

function SeccionParametros({ selectData, onFilterChange, isFetchingData }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const initialValues = {
    lapso: "",
    sede: "",
    pnf: "",
    trayecto: "",
  };

  // Función para generar y descargar el PDF
  const handleGenerarPDF = async () => {
    const params = Object.fromEntries(
      Object.entries(formik.values).filter(([_, v]) => v !== "")
    );

    setIsGenerating(true);
    try {
      await generarReporteSecciones(params);
    } catch (error) {
      console.error("Detalles del error al generar reporte:", error);
      notify.error(
        `Error al generar el reporte de secciones. Por favor, inténtalo de nuevo.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit: () => { },
  });

  // Dispara la búsqueda en cada cambio de valor del formulario
  useEffect(() => {
    const cleanFilters = Object.fromEntries(
      Object.entries(formik.values)
        .filter(([_, v]) => v !== "")
    );

    onFilterChange(cleanFilters);
  }, [formik.values, onFilterChange]);

  if (!selectData) return null;

  return (
    <form onSubmit={formik.handleSubmit} className="mb-6 bg-white/50 dark:bg-slate-900/50 p-4 uppercase rounded-xl border border-gray-100 dark:border-slate-800 backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lapso */}
        <div className="space-y-2">
          <Label>Lapso</Label>
          <SelectSearch
            name="lapso"
            options={selectData?.lapsos || []}
            formik={formik}
            labelKey="nombre_lapso"
            valueKey="id"
            placeholder="Seleccione un Lapso"
            className="mb-4"
          />
        </div>

        {/* Sede */}
        <div className="space-y-2">
          <Label>Sede</Label>
          <SelectSearch
            name="sede"
            options={selectData?.sedes || []}
            formik={formik}
            labelKey="nombre_sede"
            valueKey="id"
            placeholder="Seleccione una Sede"
            className="mb-4"
          />
        </div>

        {/* PNF */}
        <div className="space-y-2">
          <Label>PNF</Label>
          <SelectSearch
            name="pnf"
            options={selectData?.pnfs || []}
            formik={formik}
            labelKey="nombre"
            valueKey="id"
            placeholder="Seleccione un PNF"
            className="mb-4"
          />
        </div>

        {/* Trayecto */}
        <div className="space-y-2">
          <Label>Trayecto</Label>
          <SelectSearch
            name="trayecto"
            options={selectData?.trayectos || []}
            formik={formik}
            labelKey="nombre"
            valueKey="id"
            placeholder="Seleccione un Trayecto"
            className="mb-4"
          />
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <Button variant="secondary" onClick={() => formik.resetForm()} type="button">
          Limpiar Filtros
        </Button>
        {/* boton para generar pdf */}
        <Button
          className="ml-2"
          variant="exportar"
          onClick={handleGenerarPDF}
          disabled={isGenerating || isFetchingData}
        >
          {isGenerating ? "Generando..." : "Generar PDF"}
        </Button>
      </div>
    </form>
  );
}

export default function Secciones() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectData, setSelectData] = useState(null);

  const [filters, setFilters] = useState({});

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

        <Guard requiredPermissions="seccion.crear"> 
          <div className="flex justify-end"> 
            <CreateSeccioneModal
              fetchSecciones={fetchSecciones}
              selectData={selectData}
            />
          </div>
        </Guard>

        <AlertDialogDestructive
          isOpen={!!deletingId}
          id={deletingId}
          onClose={() => setDeletingId(null)}
          onSuccess={() => fetchSecciones(filters)}
          deleteFunction={deleteSeccion}
        />
      </div>

      <SeccionParametros selectData={selectData} onFilterChange={handleFilterChange} isFetchingData={loading} />
      <div className="my-4">
        <DataTable
          columns={columns(handleEdit, onDelete)}
          data={data}
          filterColumn="nombre"
        />
      </div>
    </div>
  );
}
