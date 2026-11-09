import React, { useEffect, useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Percent, School } from "lucide-react";
import { notify } from "@/components/shared/Notify";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getConfiguracionesPnf,
  saveConfiguracionTrayecto,
  DEFAULT_CONFIG_TRAYECTO,
} from "@/services/configuracionPnfService";

import HeaderSeccion from "./HeaderSeccion";
import CardParametro from "./CardParametro";
import PanelSimulacion from "./PanelSimulacion";
import DistribucionAulas from "./DistribucionAulas";
import BotonGuardar from "./BotonGuardar";

// ─── Constantes de Trayectos ─────────────────────────────────────────────────
const TRAYECTOS = [
  { id: 1, label: "Trayecto I" },
  { id: 2, label: "Trayecto II" },
  { id: 3, label: "Trayecto III" },
  { id: 4, label: "Trayecto IV" },
];

const PNF_ID = 1;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const buildDefaultValues = () => ({
  max_estudiantes_seccion: DEFAULT_CONFIG_TRAYECTO.max_estudiantes_seccion,
  tasa_aprobacion_base: DEFAULT_CONFIG_TRAYECTO.tasa_aprobacion_base,
  tasa_reprobacion_base: DEFAULT_CONFIG_TRAYECTO.tasa_reprobacion_base,
});

const valuesFromConfig = (config) => ({
  max_estudiantes_seccion:
    config?.max_estudiantes_seccion ?? DEFAULT_CONFIG_TRAYECTO.max_estudiantes_seccion,
  tasa_aprobacion_base:
    config?.tasa_aprobacion_base ?? DEFAULT_CONFIG_TRAYECTO.tasa_aprobacion_base,
  tasa_reprobacion_base:
    config?.tasa_reprobacion_base ?? DEFAULT_CONFIG_TRAYECTO.tasa_reprobacion_base,
});

// ─── Schema de validación ─────────────────────────────────────────────────────
const validationSchema = Yup.object({
  max_estudiantes_seccion: Yup.number()
    .integer("Debe ser un número entero")
    .min(15, "Mínimo 15 estudiantes")
    .max(50, "Máximo 50 estudiantes")
    .required("Este campo es obligatorio"),
  tasa_aprobacion_base: Yup.number()
    .min(0, "Mínimo 0%")
    .max(100, "Máximo 100%")
    .required("Este campo es obligatorio")
    .test("suma-100-aprobacion", "La suma de tasas debe ser 100%", function (val) {
      const { tasa_reprobacion_base } = this.parent;
      if (val === undefined || tasa_reprobacion_base === undefined) return true;
      return parseFloat((Number(val) + Number(tasa_reprobacion_base)).toFixed(2)) === 100;
    }),
  tasa_reprobacion_base: Yup.number()
    .min(0, "Mínimo 0%")
    .max(100, "Máximo 100%")
    .required("Este campo es obligatorio")
    .test("suma-100-reprobacion", "La suma de tasas debe ser 100%", function (val) {
      const { tasa_aprobacion_base } = this.parent;
      if (val === undefined || tasa_aprobacion_base === undefined) return true;
      return parseFloat((Number(val) + Number(tasa_aprobacion_base)).toFixed(2)) === 100;
    }),
});

// ─── Componente ───────────────────────────────────────────────────────────────
export default function ConfiguracionPNF() {
  const [loading, setLoading] = useState(true);
  const [trayectoSeleccionado, setTrayectoSeleccionado] = useState(TRAYECTOS[0].id);
  // Array de configuraciones por trayecto recibidas desde la API
  const [listaConfiguraciones, setListaConfiguraciones] = useState([]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Configuración del PNF", href: "/configuraciones_pnf" },
  ];

  // ── Formik ────────────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues: buildDefaultValues(),
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          pnf_id: PNF_ID,
          trayecto_id: trayectoSeleccionado,
          max_estudiantes_seccion: values.max_estudiantes_seccion,
          tasa_aprobacion_base: values.tasa_aprobacion_base,
          tasa_reprobacion_base: values.tasa_reprobacion_base,
        };

        const response = await saveConfiguracionTrayecto(payload);

        // Actualizar el array local para reflejar los nuevos valores guardados
        setListaConfiguraciones((prev) => {
          const idx = prev.findIndex((c) => c.trayecto_id === trayectoSeleccionado);
          const updated = { ...payload, ...(response?.data ?? {}) };
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updated;
            return next;
          }
          return [...prev, updated];
        });

        notify.success(response?.message || "Configuración guardada con éxito.");
        formik.resetForm({ values });
      } catch (error) {
        console.error("Error saving parameters:", error);
        notify.error("Error al guardar los parámetros del trayecto.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await getConfiguracionesPnf(PNF_ID);
        const configs = Array.isArray(data) ? data : [];
        setListaConfiguraciones(configs);

        // Setear valores del trayecto inicial
        const configInicial = configs.find((c) => c.trayecto_id === TRAYECTOS[0].id);
        formik.setValues(valuesFromConfig(configInicial));
      } catch (error) {
        console.error("Error loading config:", error);
        notify.error("Error al cargar la configuración. Usando valores por defecto.");
        formik.setValues(buildDefaultValues());
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  // ── Cambio de pestaña ──────────────────────────────────────────────────────
  const handleCambioTrayecto = useCallback(
    (trayectoId) => {
      setTrayectoSeleccionado(trayectoId);
      const config = listaConfiguraciones.find((c) => c.trayecto_id === trayectoId);
      formik.resetForm({ values: valuesFromConfig(config) });
    },
    [listaConfiguraciones]
  );

  // ── Handlers balanceo de tasas ─────────────────────────────────────────────
  const handleTasaAprobacionChange = (newValue) => {
    formik.setFieldValue("tasa_aprobacion_base", newValue);
    if (newValue === "") {
      formik.setFieldValue("tasa_reprobacion_base", "");
      return;
    }
    const counterpart = parseFloat((100 - newValue).toFixed(2));
    if (counterpart >= 0 && counterpart <= 100) {
      formik.setFieldValue("tasa_reprobacion_base", counterpart);
    }
  };

  const handleTasaReprobacionChange = (newValue) => {
    formik.setFieldValue("tasa_reprobacion_base", newValue);
    if (newValue === "") {
      formik.setFieldValue("tasa_aprobacion_base", "");
      return;
    }
    const counterpart = parseFloat((100 - newValue).toFixed(2));
    if (counterpart >= 0 && counterpart <= 100) {
      formik.setFieldValue("tasa_aprobacion_base", counterpart);
    }
  };

  // ── Skeleton de carga ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-10 w-96 bg-slate-200 dark:bg-slate-800 rounded-md" />
        {/* Tabs skeleton */}
        <div className="flex gap-2">
          {TRAYECTOS.map((t) => (
            <div key={t.id} className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-[210px] rounded-2xl" />
              <Skeleton className="h-[210px] rounded-2xl" />
              <Skeleton className="h-[210px] rounded-2xl" />
            </div>
            <Skeleton className="h-[250px] rounded-2xl" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-[520px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const labelTrayectoActivo =
    TRAYECTOS.find((t) => t.id === trayectoSeleccionado)?.label ?? "Trayecto";

  return (
    <div className="flex flex-col gap-4">
      {/* Header Sección */}
      <HeaderSeccion
        isDirty={formik.isDirty}
        isSubmitting={formik.isSubmitting}
        items={breadcrumbItems}
      />

      {/* Formulario Principal */}
      <form onSubmit={formik.handleSubmit} className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Columna de Parámetros */}
          <div className="lg:col-span-8 space-y-6">

            {/* ── Tabs de Trayectos ───────────────────────────────────────── */}
            <div className="flex flex-wrap gap-2 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 w-fit">
              {TRAYECTOS.map((trayecto) => {
                const isActive = trayecto.id === trayectoSeleccionado;
                return (
                  <button
                    key={trayecto.id}
                    type="button"
                    onClick={() => handleCambioTrayecto(trayecto.id)}
                    className={[
                      "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                      isActive
                        ? "bg-white dark:bg-[#0f172a] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700/70 scale-[1.02]"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/50",
                    ].join(" ")}
                    aria-pressed={isActive}
                    aria-label={`Seleccionar ${trayecto.label}`}
                  >
                    {trayecto.label}
                  </button>
                );
              })}
            </div>

            {/* ── Cards de Parámetros ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Estudiantes por Sección */}
              <CardParametro
                icon={School}
                title="Estudiantes por Sección"
                name="max_estudiantes_seccion"
                value={formik.values.max_estudiantes_seccion}
                error={formik.errors.max_estudiantes_seccion}
                touched={formik.touched.max_estudiantes_seccion}
                min={15}
                max={50}
                step={1}
                suffix=" est."
                formik={formik}
              />

              {/* Tasa Aprobación */}
              <CardParametro
                icon={Percent}
                title="Tasa de Aprobación"
                name="tasa_aprobacion_base"
                value={formik.values.tasa_aprobacion_base}
                error={formik.errors.tasa_aprobacion_base}
                touched={formik.touched.tasa_aprobacion_base}
                min={0}
                max={100}
                step={0.5}
                suffix="%"
                formik={formik}
                onChangeCallback={handleTasaAprobacionChange}
              />

              {/* Tasa Reprobación */}
              <CardParametro
                icon={Percent}
                title="Tasa de Reprobación"
                name="tasa_reprobacion_base"
                value={formik.values.tasa_reprobacion_base}
                error={formik.errors.tasa_reprobacion_base}
                touched={formik.touched.tasa_reprobacion_base}
                min={0}
                max={100}
                step={0.5}
                suffix="%"
                formik={formik}
                onChangeCallback={handleTasaReprobacionChange}
              />

            </div>

            {/* Distribución de Aulas Estimada */}
            <DistribucionAulas values={formik.values} />

            {/* ── Fila inferior: nota + botón guardar ─────────────────────── */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md">
                * Guardar actualizará los parámetros del motor algorítmico para el{" "}
                <span className="font-semibold text-indigo-500 dark:text-indigo-400">
                  {labelTrayectoActivo}
                </span>
                . Las proyecciones de secciones se recalcularán usando estos valores.
              </p>
              <BotonGuardar isSubmitting={formik.isSubmitting} />
            </div>
          </div>

          {/* Columna Live Preview */}
          <div className="lg:col-span-4">
            <PanelSimulacion
              values={formik.values}
              isValid={formik.isValid}
              labelTrayecto={labelTrayectoActivo}
            />
          </div>

        </div>
      </form>
    </div>
  );
}
