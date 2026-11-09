import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import SelectSearch from "@/components/shared/SelectSearch";
import { notify } from "@/components/shared/Notify";
import { prepararPaso1, guardarPaso1 } from "@/services/proyeccionService";
import { Save, ArrowRight, TableProperties, AlertCircle, Info, CalendarRange, GraduationCap, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Yup validation schema for Step 1
const step1ValidationSchema = Yup.object().shape({
  ano_academico_id: Yup.string().required("El año académico objetivo es obligatorio"),
  pnf_id: Yup.string().required("El PNF es obligatorio"),
  secciones: Yup.array().of(
    Yup.object().shape({
      grupos_aprobados: Yup.number()
        .typeError("Debe ser un número")
        .integer("Debe ser un número entero")
        .min(0, "Mínimo 0")
        .required("Obligatorio"),
      grupos_reprobados: Yup.number()
        .typeError("Debe ser un número")
        .integer("Debe ser un número entero")
        .min(0, "Mínimo 0")
        .required("Obligatorio"),
    })
  ),
});

export default function Paso1Secciones({
  anosAcademicos = [],
  pnfs = [],
  isAdmin = false,
  pnfCoordinadorId = null,
  onStepComplete,
  initialSelection = { ano_academico_id: "", pnf_id: "", secciones: [] }
}) {
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [templateLoaded, setTemplateLoaded] = useState(
    !!(initialSelection?.secciones && initialSelection.secciones.length > 0)
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Mapear los datos para el SelectSearch
  const optionsAnos = (anosAcademicos || []).map((item) => ({
    id: String(item.id),
    nombre: item.ano ? `Año Académico ${item.ano}` : item.nombre || String(item.id),
  }));

  const optionsPnfs = (pnfs || []).map((item) => ({
    id: String(item.id),
    nombre: item.nombre || item.codigo || String(item.id),
  }));

  // Inicializar Formik
  const formik = useFormik({
    initialValues: {
      ano_academico_id: initialSelection.ano_academico_id ? String(initialSelection.ano_academico_id) : "",
      pnf_id: isAdmin
        ? initialSelection.pnf_id
          ? String(initialSelection.pnf_id)
          : ""
        : pnfCoordinadorId
          ? String(pnfCoordinadorId)
          : "",
      secciones: (
        initialSelection?.ano_academico_id &&
        initialSelection?.secciones &&
        initialSelection.secciones.length > 0
      ) ? initialSelection.secciones : [],
    },
    validationSchema: step1ValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ano_academico_id: Number(values.ano_academico_id),
          pnf_id: Number(values.pnf_id),
          secciones: values.secciones.map((sec) => ({
            ...sec,
            id: sec.id,
            seccion_id: sec.seccion_id || sec.id,
            grupos_aprobados: Number(sec.grupos_aprobados),
            grupos_reprobados: Number(sec.grupos_reprobados),
          })),
        };

        const res = await guardarPaso1(payload);
        notify.success("¡Paso 1 guardado con éxito!");

        // Extraer proyeccion_id del backend (soporta respuesta directa y anidada en .data)
        const rawRes = res?.data || res || {};
        const proyeccionId = rawRes?.proyeccion_id || rawRes?.id || null;

        // Persistir transición al Paso 2 en sessionStorage
        if (proyeccionId) sessionStorage.setItem("wizard_proyeccion_id", String(proyeccionId));
        sessionStorage.setItem("wizard_paso_actual", "2");
        sessionStorage.setItem("wizard_ano_id", String(values.ano_academico_id));
        sessionStorage.setItem("wizard_pnf_id", String(values.pnf_id));

        // Ejecutar callback para avanzar al paso 2 pasándole los datos de selección
        onStepComplete({
          ano_academico_id: values.ano_academico_id,
          pnf_id: values.pnf_id,
          secciones: values.secciones,
          proyeccion_id: proyeccionId,
        });
      } catch (error) {
        console.error(error);
        const errorMsg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Error al guardar la plantilla base de secciones.";
        notify.error(errorMsg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const selectedAnoId = formik.values.ano_academico_id;
  const selectedPnfId = formik.values.pnf_id;

  // Cargar plantilla cuando el año académico y el PNF estén seleccionados
  useEffect(() => {
    if (!selectedAnoId || !selectedPnfId) {
      formik.setFieldValue("secciones", []);
      setTemplateLoaded(false);
      return;
    }

    // Si ya coincide con la selección inicial y hay secciones cargadas, evitar llamar a la API
    const isSameSelection =
      String(initialSelection?.ano_academico_id) === String(selectedAnoId) &&
      String(initialSelection?.pnf_id) === String(selectedPnfId);

    if (isSameSelection && initialSelection?.secciones && initialSelection.secciones.length > 0) {
      if (formik.values.secciones.length === 0) {
        formik.setFieldValue("secciones", initialSelection.secciones);
        setTemplateLoaded(true);
      }
      return;
    }

    const loadTemplate = async () => {
      setLoadingTemplate(true);
      try {
        const data = await prepararPaso1({
          ano_academico_id: Number(selectedAnoId),
          pnf_id: Number(selectedPnfId),
        });

        // ── Nueva estructura de respuesta del backend ──
        // { status, es_borrador_recuperado, proyeccion_id, estado, message, meta, plantilla }
        const rawResp = data?.data || data || {};
        const esBorradorRecuperado = rawResp?.es_borrador_recuperado ?? false;
        const proyeccionIdCargado = rawResp?.proyeccion_id || null;

        // Extraer secciones de forma ultra defensiva
        let seccionesData = [];
        if (Array.isArray(data)) {
          seccionesData = data;
        } else if (rawResp?.plantilla && Array.isArray(rawResp.plantilla)) {
          seccionesData = rawResp.plantilla;
        } else if (rawResp?.secciones && Array.isArray(rawResp.secciones)) {
          seccionesData = rawResp.secciones;
        } else if (Array.isArray(rawResp?.data)) {
          seccionesData = rawResp.data;
        } else {
          seccionesData = [];
        }

        // Mapear campos para asegurarnos que estén estructurados y tengan valores por defecto
        const mappedSecciones = seccionesData.map((sec) => ({
          ...sec,
          grupos_aprobados: sec.grupos_aprobados !== undefined && sec.grupos_aprobados !== null ? sec.grupos_aprobados : 0,
          grupos_reprobados: sec.grupos_reprobados !== undefined && sec.grupos_reprobados !== null ? sec.grupos_reprobados : 0,
        }));

        const sortedSecciones = mappedSecciones.sort((a, b) => {
          const getTrayectoNumber = (t) => {
            if (t === null || t === undefined) return 0;
            const str = String(t).toUpperCase().trim();
            if (str === "PIU" || str === "INICIAL" || str === "TRANSICION" || str === "TRANSICIÓN") return 0;
            const match = str.match(/\d+/);
            return match ? Number(match[0]) : 99;
          };

          const tA = getTrayectoNumber(a.trayecto_nombre || a.trayecto?.nombre || a.trayecto);
          const tB = getTrayectoNumber(b.trayecto_nombre || b.trayecto?.nombre || b.trayecto);

          if (tA !== tB) return tA - tB;

          const sedeA = a.sede_nombre || a.sede?.nombre || a.sede || "";
          const sedeB = b.sede_nombre || b.sede?.nombre || b.sede || "";
          if (sedeA !== sedeB) return sedeA.localeCompare(sedeB);

          const secA = a.seccion_origen || a.seccion?.nombre || a.nombre_seccion || a.codigo_seccion || "";
          const secB = b.seccion_origen || b.seccion?.nombre || b.nombre_seccion || b.codigo_seccion || "";
          return secA.localeCompare(secB);
        });

        formik.setFieldValue("secciones", sortedSecciones);
        setTemplateLoaded(true);

        // Persistir en sessionStorage para rehidratación tras F5
        if (proyeccionIdCargado) sessionStorage.setItem("wizard_proyeccion_id", String(proyeccionIdCargado));
        sessionStorage.setItem("wizard_ano_id", String(selectedAnoId));
        sessionStorage.setItem("wizard_pnf_id", String(selectedPnfId));
        sessionStorage.setItem("wizard_paso_actual", "1");

        // Notificaciones al usuario
        if (esBorradorRecuperado) {
          notify.info("Se recuperó tu progreso anterior. Puedes continuar editando desde donde lo dejaste.");
        } else if (sortedSecciones.length > 0) {
          notify.success(`Plantilla cargada con ${sortedSecciones.length} secciones (ordenadas).`);
        } else {
          notify.info("No se encontraron registros de secciones del año anterior para este PNF.");
        }
      } catch (error) {
        console.error(error);
        notify.error("Error al cargar la plantilla base de secciones.");
        formik.setFieldValue("secciones", []);
        setTemplateLoaded(false);
      } finally {
        setLoadingTemplate(false);
      }
    };

    loadTemplate();
  }, [selectedAnoId, selectedPnfId]);

  return (
    <div className="space-y-6">
      {/* ── SECCIÓN DE CONFIGURACIÓN DE CONTEXTO ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm">
        {/* Selector de Año Académico */}
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="ano_academico_id" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold text-sm">
            <CalendarRange className="w-4 h-4 text-indigo-500" />
            Año Académico
          </Label>
          <SelectSearch
            name="ano_academico_id"
            options={optionsAnos}
            formik={formik}
            valueKey="id"
            labelKey="nombre"
            placeholder="Seleccione el Año Académico"
            div_style="w-full"
          />
          {formik.touched.ano_academico_id && formik.errors.ano_academico_id && (
            <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {formik.errors.ano_academico_id}
            </p>
          )}
        </div>

        {/* Selector de PNF (Solo para Administradores) */}
        {isAdmin ? (
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="pnf_id" className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold text-sm">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              Programa Nacional de Formación (PNF)
            </Label>
            <SelectSearch
              name="pnf_id"
              options={optionsPnfs}
              formik={formik}
              valueKey="id"
              labelKey="nombre"
              placeholder="Seleccione el PNF"
              div_style="w-full"
            />
            {formik.touched.pnf_id && formik.errors.pnf_id && (
              <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {formik.errors.pnf_id}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col justify-end p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Programa Nacional de Formación:
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
              {optionsPnfs.find((p) => String(p.id) === String(selectedPnfId))?.nombre || "PNF Coordinador Asignado"}
            </p>
          </div>
        )}
      </div>

      {/* ── SKELETON LOADER ── */}
      {loadingTemplate && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      )}

      {/* ── TABLA DE EDICIÓN DE PLANTILLA BASE ── */}
      {!loadingTemplate && templateLoaded && (
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <TableProperties className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    Histórico de Secciones (Plantilla Base)
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Edite los grupos aprobados y reprobados obtenidos en el año académico anterior.
                  </p>
                </div>
              </div>
            </div>

            {formik.values.secciones.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <Info className="w-10 h-10 text-slate-400" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  No se encontraron secciones para este período y PNF.
                </p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Verifique si el año académico anterior tiene secciones registradas o cambie la selección.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Sede</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Trayecto</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Sección Origen</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Tipo Matrícula</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-36 text-center">Grupos Aprobados</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-36 text-center">Grupos Reprobados</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formik.values.secciones
                      .map((sec, globalIndex) => ({ ...sec, globalIndex }))
                      .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
                      .map((secData) => {
                        const sec = secData;
                        const idx = secData.globalIndex;
                        const aprobadoError = formik.touched.secciones?.[idx]?.grupos_aprobados && formik.errors.secciones?.[idx]?.grupos_aprobados;
                        const reprobadoError = formik.touched.secciones?.[idx]?.grupos_reprobados && formik.errors.secciones?.[idx]?.grupos_reprobados;
                        const isPIU = (sec.trayecto_nombre || sec.trayecto?.nombre || sec.trayecto) == "0" ||
                          String(sec.trayecto_nombre || sec.trayecto?.nombre || sec.trayecto).toUpperCase() === "PIU";

                        return (
                          <TableRow key={sec.id || idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20">
                            {/* Sede (Solo lectura) */}
                            <TableCell className="font-medium text-slate-800 dark:text-slate-300">
                              {sec.sede_nombre || sec.sede?.nombre || sec.sede || "Sede Principal"}
                            </TableCell>
                            {/* Trayecto (Solo lectura) */}
                            <TableCell className="text-slate-600 dark:text-slate-400 font-medium">
                              {sec.trayecto_nombre || sec.trayecto?.nombre || sec.trayecto || "Trayecto"}
                            </TableCell>
                            {/* Sección Origen (Solo lectura) */}
                            <TableCell className="text-slate-600 dark:text-slate-400">
                              {sec.seccion_origen || sec.seccion?.nombre || sec.nombre_seccion || sec.codigo_seccion || "Sección"}
                            </TableCell>
                            {/* Tipo Matrícula (Solo lectura) */}
                            <TableCell className="text-slate-600 dark:text-slate-400">
                              {sec.tipo_matricula || sec.matricula?.nombre || sec.matricula || "Regular"}
                            </TableCell>
                            {/* Grupos Aprobados (Editable) */}
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                {isPIU && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600/80 dark:text-indigo-400/80 mb-1">
                                    Cant. Estudiantes
                                  </span>
                                )}
                                <Input
                                  type="number"
                                  min="0"
                                  name={`secciones[${idx}].grupos_aprobados`}
                                  value={formik.values.secciones[idx].grupos_aprobados}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  className={`w-24 text-center no-spinner ${aprobadoError ? "border-red-500 focus-visible:border-red-500" : ""}`}
                                />
                                {aprobadoError && (
                                  <span className="text-[10px] text-red-500 mt-1 font-medium">
                                    {aprobadoError}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            {/* Grupos Reprobados (Editable) */}
                            <TableCell className="text-center">
                              {!isPIU ? (
                                <div className="flex flex-col items-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    name={`secciones[${idx}].grupos_reprobados`}
                                    value={formik.values.secciones[idx].grupos_reprobados}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-24 text-center no-spinner ${reprobadoError ? "border-red-500 focus-visible:border-red-500" : ""}`}
                                  />
                                  {reprobadoError && (
                                    <span className="text-[10px] text-red-500 mt-1 font-medium">
                                      {reprobadoError}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">No aplica</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* --- CONTROLES DE PAGINACIÓN --- */}
            {formik.values.secciones.length > 0 && (() => {
              const totalItems = formik.values.secciones.length;
              const pages = Math.ceil(totalItems / pageSize);
              return (
                <div className="flex flex-col gap-4 px-4 py-4 border-t border-slate-100 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-[#0f172a] rounded-b-2xl">
                  <div className="flex-1 text-sm text-slate-500 font-medium">
                    Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, totalItems)} de {totalItems} filas.
                  </div>

                  <div className="flex flex-col items-center gap-4 sm:flex-row lg:gap-8">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-300">
                        Filas por página:
                      </span>
                      <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                          setPageSize(Number(value));
                          setCurrentPage(0);
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                          {[10, 20, 30, 40, 50].map((size) => (
                            <SelectItem key={size} value={`${size}`}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex w-[100px] items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-300">
                      Página {pages > 0 ? currentPage + 1 : 0} de {pages || 1}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => setCurrentPage(0)}
                        disabled={currentPage === 0}
                      >
                        <span className="sr-only">Ir a la primera página</span>
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                        disabled={currentPage === 0}
                      >
                        <span className="sr-only">Ir a la página anterior</span>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pages - 1))}
                        disabled={currentPage >= pages - 1 || pages === 0}
                      >
                        <span className="sr-only">Ir a la página siguiente</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => setCurrentPage(pages - 1)}
                        disabled={currentPage >= pages - 1 || pages === 0}
                      >
                        <span className="sr-only">Ir a la última página</span>
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Botón de acción */}
          {formik.values.secciones.length > 0 && (
            <div className="flex justify-end items-center p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm">
              <Button
                type="submit"
                disabled={formik.isSubmitting || !formik.isValid}
                className="w-full sm:w-auto px-6 py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
              >
                {formik.isSubmitting ? "Guardando..." : "Guardar y Continuar"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </form>
      )}

      {/* ── ESTADO INICIAL VACÍO (SIN SELECCIÓN) ── */}
      {!loadingTemplate && !templateLoaded && (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-3.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <CalendarRange className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-2">
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Configuración Inicial Requerida
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Seleccione el <strong>Año Académico</strong> {isAdmin && <>y el <strong>Programa Nacional de Formación (PNF)</strong></>} para cargar la plantilla de secciones e iniciar la proyección.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
