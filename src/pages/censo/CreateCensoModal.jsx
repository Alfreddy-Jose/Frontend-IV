import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { createCenso } from "@/services/censoService";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { ModernInput } from "@/components/shared/InputModerno";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon } from "lucide-react";
import { useUpperCase } from "@/hooks/useUpperCase";
import SelectSearch from "@/components/shared/SelectSearch";
import { useAuth } from "@/context/AuthContext";
import { ModernTextarea } from "@/components/shared/ModernTextarea";

export default function CreateCensoModal({
  fetchCensos,
  estudiantes = [],
  unidadesCurriculares = [],
  listaPnfs = [],
  listaSecciones = [],
  loadingEstudiantes = false,
}) {
  const [openModal, setOpenModal] = useState(false);
  const { lapsoActual } = useAuth();

  // Esquema de validación Yup
  const validationSchema = useMemo(
    () =>
      Yup.object({
        estudiante_id: Yup.string().required("Este campo es obligatorio"),
        tipo_censo: Yup.string().required("Este campo es obligatorio"),

        // Políticas estudiantiles
        disciplina_deportiva: Yup.string().when("deportista", {
          is: true,
          then: (schema) =>
            schema.required("Debe ingresar la disciplina deportiva"),
          otherwise: (schema) => schema.nullable(),
        }),
        instrumento_musical: Yup.string().when("musico", {
          is: true,
          then: (schema) =>
            schema.required("Debe ingresar el instrumento musical"),
          otherwise: (schema) => schema.nullable(),
        }),
        semanas_gestacion: Yup.number().when("embarazada", {
          is: true,
          then: (schema) =>
            schema
              .required("Debe indicar las semanas de gestación")
              .min(1, "Mínimo 1")
              .max(42, "Máximo 42"),
          otherwise: (schema) => schema.nullable(),
        }),
        cuidado_especial: Yup.string().when("discapacidad", {
          is: true,
          then: (schema) => schema.required("Debe seleccionar una condición"),
          otherwise: (schema) => schema.nullable(),
        }),
        diagnostico_detallado: Yup.string().when("discapacidad", {
          is: true,
          then: (schema) =>
            schema.required("Debe indicar el diagnóstico detallado"),
          otherwise: (schema) => schema.nullable(),
        }),

        // Censo académico
        subtipo_tramite: Yup.string().when("tipo_censo", {
          is: "ACADEMICO",
          then: (schema) =>
            schema.required("Debe seleccionar el subtipo de trámite"),
          otherwise: (schema) => schema.nullable(),
        }),
        asignaturas_pendientes: Yup.array().when("subtipo_tramite", {
          is: "PLAN MULTIMODAL",
          then: (schema) =>
            schema
              .min(1, "Debe seleccionar al menos una asignatura")
              .required("Debe seleccionar asignaturas"),
          otherwise: (schema) => schema.nullable(),
        }),
        pnf_destino: Yup.string().when(["tipo_censo", "subtipo_tramite"], {
          is: (tipo, subtipo) =>
            tipo === "ACADEMICO" && subtipo === "CAMBIO DE PNF",
          then: (schema) =>
            schema.required("Debe seleccionar el PNF de destino"),
          otherwise: (schema) => schema.nullable(),
        }),
        seccion_destino: Yup.string().when(["tipo_censo", "subtipo_tramite"], {
          is: (tipo, subtipo) =>
            tipo === "ACADEMICO" && subtipo === "CAMBIO DE SECCION",
          then: (schema) =>
            schema.required("Debe seleccionar la sección de destino"),
          otherwise: (schema) => schema.nullable(),
        }),
      }),
    [],
  );

  const initialValues = {
    estudiante_id: "",
    tipo_censo: "",
    nombre: "",
    observaciones: "",
    lapso_id: "",
    deportista: false,
    musico: false,
    embarazada: false,
    discapacidad: false,
    categoria: "",
    disciplina: "",
    instrumento: "",
    semanas_gestacion: "",
    tipo_condicion: "",
    grado_condicion: "",
    subtipo_tramite: "",
    asignaturas_pendientes: [],
    pnf_destino: "",
    seccion_destino: "",
  };

  // 1. Inicialización de Formik
  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const nombreLapso = lapsoActual?.nombre_lapso || "PERIODO ACTUAL";
      const nombreInstitucional = `CENSO DE ${values.tipo_censo} - LAPSO ${nombreLapso}`;

      let categoriaReal = "GENERAL";
      if (values.deportista) categoriaReal = "DEPORTISTA";
      else if (values.musico) categoriaReal = "MUSICO";
      else if (values.embarazada) categoriaReal = "EMBARAZADA";
      else if (values.discapacidad) categoriaReal = "DISCAPACIDAD";

      // El PNF de origen real siempre será el extraído del estudiante seleccionado
      const pnfOrigenReal = pnfOrigenEstudiante?.id || null;

      const payload = {
        estudiante_id: values.estudiante_id,
        lapso_id: lapsoActual?.id,
        nombre: nombreInstitucional,
        tipo_censo: values.tipo_censo,
        observaciones:
          values.tipo_censo === "ACADEMICO" ? values.observaciones : null,
        detalles:
          values.tipo_censo === "POLITICAS ESTUDIANTILES"
            ? {
                categoria: categoriaReal,
                disciplina: values.deportista
                  ? values.disciplina_deportiva
                  : null,
                instrumento: values.musico ? values.instrumento_musical : null,
                semanas_gestacion: values.embarazada
                  ? values.semanas_gestacion
                  : null,
                tipo_condicion: values.discapacidad
                  ? values.cuidado_especial
                  : null,
                grado_condicion: values.discapacidad
                  ? values.diagnostico_detallado
                  : null,
              }
            : {
                subtipo_academico: values.subtipo_tramite,
                ...(values.subtipo_tramite === "CAMBIO DE PNF" && {
                  pnf_origen_id: pnfOrigenReal, // Se envía de manera transparente al backend
                  pnf_destino_id: values.pnf_destino,
                }),
                ...(values.subtipo_tramite === "CAMBIO DE SECCION" && {
                  seccion_origen_id: seccionOrigenEstudiante?.id || null,
                  seccion_destino_id: values.seccion_destino,
                }),
                asignaturas_pendientes:
                  values.subtipo_tramite === "PLAN MULTIMODAL"
                    ? values.asignaturas_pendientes
                    : [],
              },
      };

      try {
        const response = await createCenso(payload);
        const menssageSuccess =
          response?.message ||
          response?.data?.message ||
          "Censo registrado exitosamente";
        notify.success(menssageSuccess);
        fetchCensos(); 
        setOpenModal(false);
        formik.resetForm();
      } catch (error) {
        console.error(error);
        notify.error(
          error.response?.data?.message || "Error al registrar el censo",
        );
      }
    },
  });

  // 2. Derivación de datos del estudiante seleccionado (evita setState en efectos)
  const estudianteSeleccionado = estudiantes.find(
    (e) => String(e.id) === String(formik.values.estudiante_id),
  );
  // Localizamos el PNF cruzando estudiante -> seccion -> pnf
  const primeraSeccion = estudianteSeleccionado?.secciones?.[0] || null;
  const pnfOrigenEstudiante = primeraSeccion?.pnf || null;
  const seccionOrigenEstudiante = primeraSeccion;

  // Si cambian de estudiante, limpiamos destino por si coincide con el origen
  useEffect(() => {
    if (
      pnfOrigenEstudiante &&
      String(formik.values.pnf_destino) === String(pnfOrigenEstudiante.id)
    ) {
      formik.setFieldValue("pnf_destino", "");
    }
    if (
      seccionOrigenEstudiante &&
      String(formik.values.seccion_destino) === String(seccionOrigenEstudiante.id)
    ) {
      formik.setFieldValue("seccion_destino", "");
    }
  }, [pnfOrigenEstudiante, seccionOrigenEstudiante, formik]);

  const { handleUpperCaseChange } = useUpperCase(formik);

  return (
    <ModalFormulario
      title="Nuevo Censo"
      description="Crear una nueva ficha de censo estudiantil"
      TextButton="Nuevo Censo"
      icon={<PlusIcon />}
      onSubmit={formik.handleSubmit}
      open={openModal}
      onOpenChange={(val) => {
        setOpenModal(val);
        if (val && lapsoActual) {
          formik.setFieldValue("lapso_id", lapsoActual.id);
        } else if (!val) {
          formik.resetForm();
        }
      }}
      loading={formik.isSubmitting}
    >
      {/* Selector Estudiante */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="estudiante_id">Estudiante</Label>
        <SelectSearch
          placeholder={
            loadingEstudiantes
              ? "Cargando estudiantes..."
              : estudiantes.length === 0
                ? "No hay estudiantes registrados"
                : "Seleccione el Estudiante"
          }
          name="estudiante_id"
          options={estudiantes.map((e) => ({
            id: e.id,
            nombre: `V-${e.persona?.cedula_persona || ""} - ${e.persona?.nombre || ""} ${e.persona?.apellido || ""}`,
          }))}
          formik={formik}
          disabled={loadingEstudiantes || estudiantes.length === 0}
        />
        {formik.touched.estudiante_id && formik.errors.estudiante_id && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.estudiante_id}
          </p>
        )}
      </div>

      {/* Tipo Censo */}
      <div className="md:col-span-12 space-y-1 flex flex-col mt-2">
        <Label htmlFor="tipo_censo">Tipo de Censo</Label>
        <SelectSearch
          placeholder="Seleccione el Tipo de Censo"
          name="tipo_censo"
          options={[
            {
              id: "POLITICAS ESTUDIANTILES",
              nombre: "POLÍTICAS ESTUDIANTILES",
            },
            { id: "ACADEMICO", nombre: "CENSO ACADÉMICO" },
          ]}
          formik={formik}
        />
        {formik.touched.tipo_censo && formik.errors.tipo_censo && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.tipo_censo}
          </p>
        )}
      </div>

      {/* FORMULARIO CONDICIONAL: POLÍTICAS ESTUDIANTILES */}
      {formik.values.tipo_censo === "POLITICAS ESTUDIANTILES" && (
        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-4 border-t pt-4 mt-2 border-slate-200 dark:border-slate-800/80 transition-all duration-300">
          <div className="md:col-span-12">
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Datos de Políticas Estudiantiles
            </h3>
          </div>

          {/* Deportista */}
          <div className="md:col-span-6 space-y-2 flex flex-col">
            <div className="flex items-center gap-3">
              <Checkbox
                id="deportista"
                checked={formik.values.deportista}
                onCheckedChange={(checked) => {
                  formik.setFieldValue("deportista", checked);
                  if (!checked)
                    formik.setFieldValue("disciplina_deportiva", "");
                }}
              />
              <Label
                htmlFor="deportista"
                className="cursor-pointer text-sm font-medium"
              >
                ¿Es Deportista?
              </Label>
            </div>
            {formik.values.deportista && (
              <div className="mt-1 transition-all duration-300">
                <Label htmlFor="disciplina_deportiva" className="mb-1">
                  Disciplina Deportiva
                </Label>
                <ModernInput
                  id="disciplina_deportiva"
                  name="disciplina_deportiva"
                  type="text"
                  placeholder="Ej: BÉISBOL, BALONCESTO"
                  onChange={handleUpperCaseChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.disciplina_deportiva}
                />
                {formik.errors.disciplina_deportiva &&
                  formik.touched.disciplina_deportiva && (
                    <p className="text-xs text-red-500 font-medium">
                      {formik.errors.disciplina_deportiva}
                    </p>
                  )}
              </div>
            )}
          </div>

          {/* Músico */}
          <div className="md:col-span-6 space-y-2 flex flex-col">
            <div className="flex items-center gap-3">
              <Checkbox
                id="musico"
                checked={formik.values.musico}
                onCheckedChange={(checked) => {
                  formik.setFieldValue("musico", checked);
                  if (!checked) formik.setFieldValue("instrumento_musical", "");
                }}
              />
              <Label
                htmlFor="musico"
                className="cursor-pointer text-sm font-medium"
              >
                ¿Es Músico?
              </Label>
            </div>
            {formik.values.musico && (
              <div className="mt-1 transition-all duration-300">
                <Label htmlFor="instrumento_musical" className='mb-1'>Instrumento Musical</Label>
                <ModernInput
                  id="instrumento_musical"
                  name="instrumento_musical"
                  type="text"
                  placeholder="Ej: GUITARRA, PIANO"
                  onChange={handleUpperCaseChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.instrumento_musical}
                />
                {formik.errors.instrumento_musical &&
                  formik.touched.instrumento_musical && (
                    <p className="text-xs text-red-500 font-medium">
                      {formik.errors.instrumento_musical}
                    </p>
                  )}
              </div>
            )}
          </div>

          {/* Embarazada */}
          <div className="md:col-span-6 space-y-2 flex flex-col">
            <div className="flex items-center gap-3">
              <Checkbox
                id="embarazada"
                checked={formik.values.embarazada}
                onCheckedChange={(checked) => {
                  formik.setFieldValue("embarazada", checked);
                  if (!checked) formik.setFieldValue("semanas_gestacion", "");
                }}
              />
              <Label
                htmlFor="embarazada"
                className="cursor-pointer text-sm font-medium"
              >
                ¿Está Embarazada?
              </Label>
            </div>
            {formik.values.embarazada && (
              <div className="mt-1 transition-all duration-300">
                <Label htmlFor="semanas_gestacion" className='mb-1'>Semanas de Gestación</Label>
                <ModernInput
                  id="semanas_gestacion"
                  name="semanas_gestacion"
                  type="number"
                  placeholder="Ej: 12"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.semanas_gestacion}
                />
                {formik.errors.semanas_gestacion &&
                  formik.touched.semanas_gestacion && (
                    <p className="text-xs text-red-500 font-medium">
                      {formik.errors.semanas_gestacion}
                    </p>
                  )}
              </div>
            )}
          </div>

          {/* Discapacidad */}
          <div className="md:col-span-6 space-y-2 flex flex-col">
            <div className="flex items-center gap-3">
              <Checkbox
                id="discapacidad"
                checked={formik.values.discapacidad}
                onCheckedChange={(checked) => {
                  formik.setFieldValue("discapacidad", checked);
                  if (!checked) {
                    formik.setFieldValue("cuidado_especial", "");
                    formik.setFieldValue("diagnostico_detallado", "");
                  }
                }}
              />
              <Label
                htmlFor="discapacidad"
                className="cursor-pointer text-sm font-medium"
              >
                ¿Discapacidad / Salud Prioritaria?
              </Label>
            </div>
            {formik.values.discapacidad && (
              <div className="mt-1 space-y-3 transition-all duration-300">
                <div>
                  <Label htmlFor="cuidado_especial" className='mb-1'>Cuidado Especial</Label>
                  <SelectSearch
                    placeholder="Seleccione Condición"
                    name="cuidado_especial"
                    options={[
                      { id: "AUTISMO", nombre: "AUTISMO" },
                      { id: "ASPERGER", nombre: "ASPERGER" },
                      { id: "ESQUIZOFRENIA", nombre: "ESQUIZOFRENIA" },
                      { id: "FISICA", nombre: "FÍSICA" },
                      { id: "OTRO", nombre: "OTRO" },
                    ]}
                    formik={formik}
                  />
                  {formik.errors.cuidado_especial &&
                    formik.touched.cuidado_especial && (
                      <p className="text-xs text-red-500 font-medium">
                        {formik.errors.cuidado_especial}
                      </p>
                    )}
                </div>
                <div>
                  <Label htmlFor="diagnostico_detallado" className='mb-1'>
                    Diagnóstico Detallado
                  </Label>
                  <ModernInput
                    id="diagnostico_detallado"
                    name="diagnostico_detallado"
                    type="text"
                    placeholder="Ej: GRADO I, DIAGNÓSTICO DETALLADO..."
                    onChange={handleUpperCaseChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.diagnostico_detallado}
                  />
                  {formik.errors.diagnostico_detallado &&
                    formik.touched.diagnostico_detallado && (
                      <p className="text-xs text-red-500 font-medium">
                        {formik.errors.diagnostico_detallado}
                      </p>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FORMULARIO CONDICIONAL: CENSO ACADÉMICO */}
      {formik.values.tipo_censo === "ACADEMICO" && (
        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-4 border-t pt-4 mt-2 border-slate-200 dark:border-slate-800/80 transition-all duration-300">
          <div className="md:col-span-12">
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Datos de Censo Académico
            </h3>
          </div>

          {/* Subtipo de Trámite */}
          <div className="md:col-span-12 space-y-1 flex flex-col">
            <Label htmlFor="subtipo_tramite">Subtipo de Trámite</Label>
            <SelectSearch
              placeholder="Seleccione el Trámite"
              name="subtipo_tramite"
              options={[
                {
                  id: "PROSECUCION",
                  nombre: "PROSECUCIÓN (Viene de otra Universidad)",
                },
                {
                  id: "REINCORPORACION",
                  nombre: "REINCORPORACIÓN (Retoma Estudios)",
                },
                { id: "CAMBIO DE PNF", nombre: "CAMBIO DE PNF" },
                { id: "CAMBIO DE SECCION", nombre: "CAMBIO DE SECCIÓN" },
                {
                  id: "PLAN MULTIMODAL",
                  nombre: "PLAN MULTIMODAL / NIVELACIÓN",
                },
              ]}
              formik={formik}
            />
            {formik.touched.subtipo_tramite &&
              formik.errors.subtipo_tramite && (
                <p className="text-xs text-red-500 font-medium">
                  {formik.errors.subtipo_tramite}
                </p>
              )}
          </div>

          {/* FLUJO UNIFICADO DE CAMBIO DE PNF */}
          {formik.values.subtipo_tramite === "CAMBIO DE PNF" && (
            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300">
              {/* PNF de Origen Estático Informativo para todos */}
              <div className="flex flex-col justify-end pb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  PNF de Origen actual
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 uppercase">
                  {pnfOrigenEstudiante
                    ? pnfOrigenEstudiante.nombre
                    : "Seleccione un estudiante primero..."}
                </span>
              </div>

              {/* PNF de Destino */}
              <div className="space-y-1 flex flex-col">
                <Label htmlFor="pnf_destino">PNF de Destino</Label>
                <SelectSearch
                  placeholder="Seleccione PNF de Destino"
                  name="pnf_destino"
                  // FILTRADO: Excluye el PNF de origen para que no aparezca en la lista
                  options={listaPnfs
                    .filter(
                      (p) => String(p.id) !== String(pnfOrigenEstudiante?.id),
                    )
                    .map((p) => ({
                      id: p.id,
                      nombre: p.nombre,
                    }))}
                  formik={formik}
                />
                {formik.touched.pnf_destino && formik.errors.pnf_destino && (
                  <p className="text-xs text-red-500 font-medium">
                    {formik.errors.pnf_destino}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* FLUJO UNIFICADO DE CAMBIO DE SECCIÓN */}
          {formik.values.subtipo_tramite === "CAMBIO DE SECCION" && (
            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300">
              {/* Sección de Origen Estática Informativa */}
              <div className="flex flex-col justify-end pb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  Sección de Origen actual
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 uppercase">
                  {seccionOrigenEstudiante
                    ? seccionOrigenEstudiante.nombre
                    : "Seleccione un estudiante primero..."}
                </span>
              </div>

              {/* Sección de Destino */}
              <div className="space-y-1 flex flex-col">
                <Label htmlFor="seccion_destino">Sección de Destino</Label>
                <SelectSearch
                  placeholder="Seleccione Sección de Destino"
                  name="seccion_destino"
                  // 🔹 FILTRADO: Excluye la sección de origen para que no aparezca en la lista
                  options={listaSecciones
                    .filter(
                      (s) =>
                        String(s.id) !== String(seccionOrigenEstudiante?.id),
                    )
                    .map((s) => ({ id: s.id, nombre: s.nombre }))}
                  formik={formik}
                />
                {formik.touched.seccion_destino &&
                  formik.errors.seccion_destino && (
                    <p className="text-xs text-red-500 font-medium">
                      {formik.errors.seccion_destino}
                    </p>
                  )}
              </div>
            </div>
          )}

          {/* Plan Multimodal */}
          {formik.values.subtipo_tramite === "PLAN MULTIMODAL" && (
            <div className="md:col-span-12 space-y-1 flex flex-col transition-all duration-300">
              <Label htmlFor="asignaturas_pendientes">
                Asignaturas Pendientes
              </Label>
              <SelectSearch
                placeholder="Seleccione las asignaturas"
                name="asignaturas_pendientes"
                options={unidadesCurriculares.map((uc) => ({
                  id: uc.id,
                  nombre: `${uc.nombre}`,
                }))}
                isMulti={true}
                formik={formik}
              />
              {formik.touched.asignaturas_pendientes &&
                formik.errors.asignaturas_pendientes && (
                  <p className="text-xs text-red-500 font-medium">
                    {formik.errors.asignaturas_pendientes}
                  </p>
                )}
            </div>
          )}

          {/* Observaciones width full */}
          <div className="md:col-span-12 space-y-1 flex flex-col">
            <Label htmlFor="observaciones">Observaciones</Label>
            <ModernTextarea
              id="observaciones"
              name="observaciones"
              type="text"
              placeholder="Ej: El estudiante solicita cambio por motivos laborales o de residencia..."
              onChange={handleUpperCaseChange}
              onBlur={formik.handleBlur}
              value={formik.values.observaciones}
            />
            {formik.errors.observaciones && formik.touched.observaciones && (
              <p className="text-xs text-red-500 font-medium">
                {formik.errors.observaciones}
              </p>
            )}
          </div>
        </div>
      )}
    </ModalFormulario>
  );
}
