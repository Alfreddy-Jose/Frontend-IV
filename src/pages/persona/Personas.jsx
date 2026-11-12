import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { DataTable } from "@/components/shared/Data_table";
import { notify } from "@/components/shared/Notify";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { deletePersona, exportarPersonasPdf, getAllPersonas } from "@/services/personaService";
import React, { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import { columnsPersonas } from "./columnsPersonas";
import { getEstados, getMunicipios } from "@/services/sedeService";
import CreatePersonasModal from "./CreatePersonasModal";
import EditPersonasModal from "./EditPersonasModal";
import { Guard } from "@/components/shared/Guard";
import GenericShowModal from "@/components/shared/GenericShowModal";
import { User, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SelectSearch from "@/components/shared/SelectSearch";
import { personaSections } from "./personaSections";

export default function Personas() {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPersonaId, setEditingPersonaId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [estados, setEstados] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isShowOpen, setIsShowOpen] = useState(false);
  const [descargandoPdf, setDescargandoPdf] = useState(false);

  // Formik para los filtros de la tabla / reporte
  const filterFormik = useFormik({
    initialValues: {
      tipo_persona: "",
      grado_inst: "",
    },
  });

  const fetchPersona = async () => {
    try {
      const persona = await getAllPersonas();
      setData(persona);
    } catch (error) {
      console.error("Error fetching persona:", error);
      notify.error(
        "Error al obtener los personas. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  // fetch para traer los Estados
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const estadosData = await getEstados();
        setEstados(estadosData);
      } catch (error) {
        console.error("Error al obtener los estados:", error);
        setEstados([]);
      }
    };
    fetchEstados();
  }, []);

  const handleEdit = (persona) => {
    setEditingPersonaId(persona.id);
  };

  const handleShow = (persona) => {
    setSelectedRecord(persona);
    setIsShowOpen(true);
  };

  const handleDelete = (persona) => {
    setDeletingId(persona.id);
  };

  useEffect(() => {
    fetchPersona();
  }, []);

  const items = [
    { label: "Home", href: "/" },
    { label: "Personas", href: "/personas" },
  ];

  // Opciones de filtro construidas a partir de los datos cargados
  const tiposPersona = useMemo(
    () =>
      [...new Set(data.map((persona) => persona.tipo_persona).filter(Boolean))]
        .sort()
        .map((tipo) => ({ id: tipo, nombre: tipo })),
    [data],
  );

  const gradosInst = useMemo(
    () =>
      [...new Set(data.map((persona) => persona.grado_inst).filter(Boolean))]
        .sort()
        .map((grado) => ({ id: grado, nombre: grado })),
    [data],
  );

  // Filtrado local en memoria según los filtros activos
  const filteredData = useMemo(() => {
    let result = Array.isArray(data) ? [...data] : [];

    if (filterFormik.values.tipo_persona) {
      result = result.filter(
        (persona) => persona.tipo_persona === filterFormik.values.tipo_persona,
      );
    }

    if (filterFormik.values.grado_inst) {
      result = result.filter(
        (persona) => persona.grado_inst === filterFormik.values.grado_inst,
      );
    }

    return result;
  }, [data, filterFormik.values.tipo_persona, filterFormik.values.grado_inst]);

  // Exportar reporte de personas a Pdf respetando los filtros activos
  const handleDescargarPdf = async () => {
    try {
      setDescargandoPdf(true);

      await notify.promise(
        (async () => {
          const params = {};

          if (filterFormik.values.tipo_persona) {
            params.tipo_persona = filterFormik.values.tipo_persona;
          }

          if (filterFormik.values.grado_inst) {
            params.grado_inst = filterFormik.values.grado_inst;
          }

          const blobData = await exportarPersonasPdf(params);
          const url = window.URL.createObjectURL(new Blob([blobData]));
          const link = document.createElement("a");
          link.href = url;
          const fecha = new Date().toISOString().slice(0, 10);
          link.setAttribute("download", `REPORTE_PERSONAS_${fecha}.pdf`);
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

  if (loading) {
    return <SkeletonTable />;
  }

  return (
    <div>
      <h1 className="mb-4 font-sans text-3xl capitalize font-semibold">Personas</h1>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb para la Navegación  */}
        <BreadcrumbReusable items={items} />

        {/* Botón de reporte + Boton para crear una Persona */}
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

          <Guard requiredPermissions="persona.crear">
            <div className="flex justify-end">
              <CreatePersonasModal
                fetchPersona={fetchPersona}
                estados={estados}
                loadMunicipios={getMunicipios}
              />
            </div>
          </Guard>
        </div>

        {/* Modal para Editar */}
        <EditPersonasModal
          isOpen={!!editingPersonaId}
          personaId={editingPersonaId}
          onClose={() => setEditingPersonaId(null)}
          onSuccess={fetchPersona}
          estados={estados}
          loadMunicipios={getMunicipios}
        />

        {/* modal para Eliminar */}
        <AlertDialogDestructive
          isOpen={!!deletingId}
          id={deletingId}
          onClose={() => setDeletingId(null)}
          onSuccess={fetchPersona}
          deleteFunction={deletePersona}
        />
      </div>
      {/* Sección de Filtros */}
      <div className="mb-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl dark:bg-slate-900/40 dark:border-slate-800/60 flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-72 flex flex-col gap-1.5">
          <Label
            htmlFor="tipo_persona"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase"
          >
            Filtrar por Tipo
          </Label>
          <SelectSearch
            placeholder="Todos los Tipos"
            name="tipo_persona"
            options={tiposPersona}
            labelKey="nombre"
            valueKey="id"
            formik={filterFormik}
          />
        </div>

        <div className="w-full md:w-72 flex flex-col gap-1.5">
          <Label
            htmlFor="grado_inst"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase"
          >
            Filtrar por Grado de Instrucción
          </Label>
          <SelectSearch
            placeholder="Todos los Grados"
            name="grado_inst"
            options={gradosInst}
            labelKey="nombre"
            valueKey="id"
            formik={filterFormik}
          />
        </div>

        {(filterFormik.values.tipo_persona || filterFormik.values.grado_inst) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              filterFormik.setFieldValue("tipo_persona", "");
              filterFormik.setFieldValue("grado_inst", "");
            }}
            className="text-xs self-end mt-1 text-indigo-600 dark:text-indigo-400"
          >
            Limpiar Filtros
          </Button>
        )}
      </div>

      <div className="my-4">
        {/* Tabla de Usuarios */}
        <DataTable
          columns={columnsPersonas(handleEdit, handleShow, handleDelete)}
          data={filteredData}
          filterColumn="nombre"
        />
      </div>

      {/* Modal para ver detalles */}
      <GenericShowModal
        isOpen={isShowOpen}
        onClose={() => setIsShowOpen(false)}
        title="Resumen de Persona"
        description={selectedRecord ? `${selectedRecord.nombre} ${selectedRecord.apellido}` : ""}
        icon={User}
        data={selectedRecord}
        sections={personaSections}
      />

    </div>
  );
}
