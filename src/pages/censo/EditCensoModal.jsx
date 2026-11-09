import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { getCensoById, updateCenso } from "@/services/censoService";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { ModernInput } from "@/components/shared/InputModerno";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpperCase } from "@/hooks/useUpperCase";
import SelectSearch from "@/components/shared/SelectSearch";
import { useAuth } from "@/context/AuthContext";
import { ModernTextarea } from "@/components/shared/ModernTextarea";

export default function EditCensoModal({
  isOpen,
  censoId,
  onClose,
  fetchCensos,
  estudiantes = [],
  unidadesCurriculares = [],
  listaPnfs = [],      
  listaSecciones = [], 
}) {
  const { lapsoActual } = useAuth();

  // Estados locales para fijar el origen informativo del estudiante seleccionado
  const [pnfOrigenEstudiante, setPnfOrigenEstudiante] = useState(null);
  const [seccionOrigenEstudiante, setSeccionOrigenEstudiante] = useState(null);

  // Esquema de validación Yup
  const validationSchema = useMemo(
    () =>
      Yup.object({
        estudiante_id: Yup.string().required("Este campo es obligatorio"),
        tipo_censo: Yup.string().required("Este campo es obligatorio"),

        // Políticas estudiantiles
        disciplina_deportiva: Yup.string().when("deportista", {
          is: true,
          then: (schema) => schema.required("Debe ingresar la disciplina deportiva"),
          otherwise: (schema) => schema.nullable(),
        }),
        instrumento_musical: Yup.string().when("musico", {
          is: true,
          then: (schema) => schema.required("Debe ingresar el instrumento"),
          otherwise: (schema) => schema.nullable(),
        }),
        semanas_gestacion: Yup.number().when("embarazada", {
          is: true,
          then: (schema) =>
            schema
              .required("Debe ingresar las semanas")
              .min(1, "Mínimo 1 semana")
              .max(42, "Máximo 42 semanas"),
          otherwise: (schema) => schema.nullable(),
        }),
        tipo_condicion: Yup.string().when("condicion_especial", {
          is: true,
          then: (schema) => schema.required("Debe seleccionar el tipo de condición"),
          otherwise: (schema) => schema.nullable(),
        }),
        grado_condicion: Yup.string().when("condicion_especial", {
          is: true,
          then: (schema) => schema.required("Debe ingresar los detalles médicos"),
          otherwise: (schema) => schema.nullable(),
        }),

        // Académicos (Trámites)
        subtipo_tramite: Yup.string().when("tipo_censo", {
          is: "ACADEMICO",
          then: (schema) => schema.required("Debe seleccionar el tipo de trámite"),
          otherwise: (schema) => schema.nullable(),
        }),
        asignaturas_pendientes: Yup.array().when(["tipo_censo", "subtipo_tramite"], {
          is: (tipo, subtipo) => tipo === "ACADEMICO" && subtipo === "PLAN MULTIMODAL",
          then: (schema) => schema.min(1, "Debe seleccionar al menos una asignatura"),
          otherwise: (schema) => schema.nullable(),
        }),
        // 🔹 VALIDADOR: PNF Destino
        pnf_destino: Yup.string().when(["tipo_censo", "subtipo_tramite"], {
          is: (tipo, subtipo) => tipo === "ACADEMICO" && subtipo === "CAMBIO DE PNF",
          then: (schema) => schema.required("Debe seleccionar el PNF de destino"),
          otherwise: (schema) => schema.nullable(),
        }),
        // 🔹 VALIDADOR: Sección Destino
        seccion_destino: Yup.string().when(["tipo_censo", "subtipo_tramite"], {
          is: (tipo, subtipo) => tipo === "ACADEMICO" && subtipo === "CAMBIO DE SECCION",
          then: (schema) => schema.required("Debe seleccionar la sección de destino"),
          otherwise: (schema) => schema.nullable(),
        }),
        observaciones: Yup.string().nullable(),
      }),
    []
  );

  const formik = useFormik({
    initialValues: {
      estudiante_id: "",
      tipo_censo: "",
      lapso_id: lapsoActual?.id || "",
      deportista: false,
      disciplina_deportiva: "",
      musico: false,
      instrumento_musical: "",
      embarazada: false,
      semanas_gestacion: "",
      condicion_especial: false,
      tipo_condicion: "",
      grado_condicion: "",
      subtipo_tramite: "",
      asignaturas_pendientes: [],
      pnf_destino: "",       // INICIALIZADO
      seccion_destino: "",   // INICIALIZADO
      observaciones: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const pnfOrigenReal = pnfOrigenEstudiante?.id || null;

        const payload = {
          estudiante_id: values.estudiante_id,
          tipo_censo: values.tipo_censo,
          lapso_id: values.lapso_id,
          observaciones: values.tipo_censo === "ACADEMICO" ? values.observaciones : null,
          detalles:
            values.tipo_censo === "POLITICAS ESTUDIANTILES"
              ? {
                  categoria: values.deportista
                    ? "DEPORTE"
                    : values.musico
                    ? "CULTURA"
                    : values.embarazada
                    ? "GESTACION"
                    : values.condicion_especial
                    ? "DISCAPACIDAD"
                    : "GENERAL",
                  disciplina: values.deportista ? values.disciplina_deportiva : null,
                  instrumento: values.musico ? values.instrumento_musical : null,
                  semanas_gestacion: values.embarazada ? values.semanas_gestacion : null,
                  tipo_condicion: values.condicion_especial ? values.tipo_condicion : null,
                  grado_condicion: values.condicion_especial ? values.grado_condicion : null,
                }
              : {
                  subtipo_academico: values.subtipo_tramite,
                  ...(values.subtipo_tramite === "CAMBIO DE PNF" && {
                    pnf_origen_id: pnfOrigenReal,
                    pnf_destino_id: values.pnf_destino,
                  }),
                  ...(values.subtipo_tramite === "CAMBIO DE SECCION" && {
                    seccion_origen_id: seccionOrigenEstudiante?.id || null,
                    seccion_destino_id: values.seccion_destino,
                  }),
                  asignaturas_pendientes:
                    values.subtipo_tramite === "PLAN MULTIMODAL" ? values.asignaturas_pendientes : [],
                },
        };

        const response = await updateCenso(censoId, payload);
        if (response.status === 200 || response.status === 201) {
          notify("Censo actualizado con éxito", "success");
          fetchCensos();
          onClose();
        }
      } catch (error) {
        console.error(error);
        notify("Error al actualizar la ficha de censo", "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { handleUpperCaseChange } = useUpperCase(formik);

  // 1. Detectar cambios en el estudiante seleccionado (Solo si el modal está abierto)
  useEffect(() => {
    if (isOpen && formik.values.estudiante_id) {
      const estudianteSeleccionado = estudiantes.find(
        (e) => String(e.id) === String(formik.values.estudiante_id)
      );

      const primeraSeccion = estudianteSeleccionado?.secciones?.[0] || null;
      const pnfEstudiante = primeraSeccion?.pnf || null;

      setPnfOrigenEstudiante(pnfEstudiante);
      setSeccionOrigenEstudiante(primeraSeccion);

      // Limpiar destinos si colisionan con el nuevo origen mapeado
      if (pnfEstudiante && String(formik.values.pnf_destino) === String(pnfEstudiante.id)) {
        formik.setFieldValue("pnf_destino", "");
      }
      if (primeraSeccion && String(formik.values.seccion_destino) === String(primeraSeccion.id)) {
        formik.setFieldValue("seccion_destino", "");
      }
    }
  }, [formik.values.estudiante_id, estudiantes, isOpen]);

  // 2. Efecto para cargar los datos del Censo a editar cuando se abre el modal
  useEffect(() => {
    if (isOpen && censoId) {
      const cargarCenso = async () => {
        try {
          const censo = await getCensoById(censoId);
          const { detalles, tipo_censo, estudiante_id, lapso_id, observaciones } = censo;

          // Mapeo básico
          formik.setFieldValue("estudiante_id", estudiante_id || "");
          formik.setFieldValue("tipo_censo", tipo_censo || "");
          formik.setFieldValue("lapso_id", lapso_id || lapsoActual?.id || "");
          formik.setFieldValue("observaciones", observaciones || "");

          if (tipo_censo === "POLITICAS ESTUDIANTILES" && detalles) {
            formik.setFieldValue("deportista", detalles.categoria === "DEPORTE");
            formik.setFieldValue("disciplina_deportiva", detalles.disciplina || "");
            formik.setFieldValue("musico", detalles.categoria === "CULTURA");
            formik.setFieldValue("instrumento_musical", detalles.instrumento || "");
            formik.setFieldValue("embarazada", detalles.categoria === "GESTACION");
            formik.setFieldValue("semanas_gestacion", detalles.semanas_gestacion || "");
            formik.setFieldValue("condicion_especial", detalles.categoria === "DISCAPACIDAD");
            formik.setFieldValue("tipo_condicion", detalles.tipo_condicion || "");
            formik.setFieldValue("grado_condicion", detalles.grado_condicion || "");
          } else if (tipo_censo === "ACADEMICO" && detalles) {
            const subtipo = detalles.subtipo_academico || detalles.subtipo_tramite || "";
            formik.setFieldValue("subtipo_tramite", subtipo);
            formik.setFieldValue("pnf_destino", detalles.pnf_destino_id || "");
            formik.setFieldValue("seccion_destino", detalles.seccion_destino_id || "");
            formik.setFieldValue("asignaturas_pendientes", detalles.asignaturas_pendientes || []);
          }
        } catch (error) {
          console.error(error);
          notify("Error al cargar datos del censo", "error");
          onClose();
        }
      };
      cargarCenso();
    }
  }, [isOpen, censoId]);

  // 3. Centralizar limpieza total del formulario al cerrar
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
      setPnfOrigenEstudiante(null);
      setSeccionOrigenEstudiante(null);
    }
  }, [isOpen]);

  return (
    <ModalFormulario
      title="Editar Ficha de Censo"
      description="Modifique los campos necesarios del censo seleccionado."
      onSubmit={formik.handleSubmit}
      open={isOpen}
      onOpenChange={onClose}
      loading={formik.isSubmitting}
      button={false}
    >
      {/* Selector Estudiante */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="estudiante_id">Estudiante</Label>
        <SelectSearch
          placeholder="Seleccione el estudiante"
          name="estudiante_id"
          options={estudiantes.map((e) => ({
            id: e.id,
            nombre: `V-${e.persona?.cedula_persona || ""} - ${e.persona?.nombre || ""} ${e.persona?.apellido || ""}`,
          }))}
          formik={formik}
          disabled={true}
        />
      </div>

      {/* Selector Tipo Censo */}
      <div className="md:col-span-12 space-y-1 flex flex-col mt-2">
        <Label htmlFor="tipo_censo">Tipo de Censo</Label>
        <SelectSearch
          placeholder="Seleccione tipo de censo"
          name="tipo_censo"
          options={[
            { id: "ACADEMICO", nombre: "ACADÉMICO" },
            { id: "POLITICAS ESTUDIANTILES", nombre: "POLÍTICAS ESTUDIANTILES" },
          ]}
          formik={formik}
          disabled={true}
        />
      </div>

      {/* === BLOQUE POLÍTICAS ESTUDIANTILES === */}
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
                  if (checked) {
                    formik.setFieldValue("musico", false);
                    formik.setFieldValue("embarazada", false);
                    formik.setFieldValue("condicion_especial", false);
                  }
                }}
              />
              <Label htmlFor="deportista" className="cursor-pointer text-sm font-medium">
                ¿Es Deportista?
              </Label>
            </div>
            {formik.values.deportista && (
              <div className="mt-1 transition-all duration-300">
                <Label htmlFor="disciplina_deportiva">Disciplina Deportiva</Label>
                <ModernInput
                  id="disciplina_deportiva"
                  name="disciplina_deportiva"
                  type="text"
                  onChange={handleUpperCaseChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.disciplina_deportiva}
                />
                {formik.errors.disciplina_deportiva && formik.touched.disciplina_deportiva && (
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
                  if (checked) {
                    formik.setFieldValue("deportista", false);
                    formik.setFieldValue("embarazada", false);
                    formik.setFieldValue("condicion_especial", false);
                  }
                }}
              />
              <Label htmlFor="musico" className="cursor-pointer text-sm font-medium">
                ¿Es Músico?
              </Label>
            </div>
            {formik.values.musico && (
              <div className="mt-1 transition-all duration-300">
                <Label htmlFor="instrumento_musical">Instrumento que ejecuta</Label>
                <ModernInput
                  id="instrumento_musical"
                  name="instrumento_musical"
                  type="text"
                  onChange={handleUpperCaseChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.instrumento_musical}
                />
                {formik.errors.instrumento_musical && formik.touched.instrumento_musical && (
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
                  if (checked) {
                    formik.setFieldValue("deportista", false);
                    formik.setFieldValue("musico", false);
                    formik.setFieldValue("condicion_especial", false);
                  }
                }}
              />
              <Label htmlFor="embarazada" className="cursor-pointer text-sm font-medium">
                ¿Está Embarazada?
              </Label>
            </div>
            {formik.values.embarazada && (
              <div className="mt-1 transition-all duration-300">
                <Label htmlFor="semanas_gestacion">Semanas de Gestación</Label>
                <ModernInput
                  id="semanas_gestacion"
                  name="semanas_gestacion"
                  type="number"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.semanas_gestacion}
                />
                {formik.errors.semanas_gestacion && formik.touched.semanas_gestacion && (
                  <p className="text-xs text-red-500 font-medium">
                    {formik.errors.semanas_gestacion}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Condición Especial / Discapacidad */}
          <div className="md:col-span-6 space-y-2 flex flex-col">
            <div className="flex items-center gap-3">
              <Checkbox
                id="condicion_especial"
                checked={formik.values.condicion_especial}
                onCheckedChange={(checked) => {
                  formik.setFieldValue("condicion_especial", checked);
                  if (checked) {
                    formik.setFieldValue("deportista", false);
                    formik.setFieldValue("musico", false);
                    formik.setFieldValue("embarazada", false);
                  }
                }}
              />
              <Label htmlFor="condicion_especial" className="cursor-pointer text-sm font-medium">
                ¿Discapacidad / Salud Prioritaria?
              </Label>
            </div>
            {formik.values.condicion_especial && (
              <div className="mt-1 space-y-3 transition-all duration-300">
                <div>
                  <Label htmlFor="tipo_condicion">Tipo de Condición</Label>
                  <SelectSearch
                    placeholder="Seleccione..."
                    name="tipo_condicion"
                    options={[
                      { id: "VISUAL", nombre: "VISUAL" },
                      { id: "AUDITIVA", nombre: "AUDITIVA" },
                      { id: "MOTORIZADA", nombre: "MOTRIZ" },
                      { id: "COGNITIVA", nombre: "NEURODIVERGENTE" },
                    ]}
                    formik={formik}
                  />
                  {formik.errors.tipo_condicion && formik.touched.tipo_condicion && (
                    <p className="text-xs text-red-500 font-medium">
                      {formik.errors.tipo_condicion}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="grado_condicion">Diagnóstico Detallado</Label>
                  <ModernInput
                    id="grado_condicion"
                    name="grado_condicion"
                    type="text"
                    onChange={handleUpperCaseChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.grado_condicion}
                  />
                  {formik.errors.grado_condicion && formik.touched.grado_condicion && (
                    <p className="text-xs text-red-500 font-medium">
                      {formik.errors.grado_condicion}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === BLOQUE TRÁMITES ACADÉMICOS === */}
      {formik.values.tipo_censo === "ACADEMICO" && (
        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-4 border-t pt-4 mt-2 border-slate-200 dark:border-slate-800/80 transition-all duration-300">
          <div className="md:col-span-12">
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Datos de Censo Académico
            </h3>
          </div>

          <div className="md:col-span-12 space-y-1 flex flex-col">
            <Label htmlFor="subtipo_tramite">Subtipo de Trámite</Label>
            <SelectSearch
              placeholder="Seleccione el subtipo de trámite"
              name="subtipo_tramite"
              options={[
                { id: "PROSECUCION", nombre: "PROSECUCIÓN (Viene de otra Universidad)" },
                { id: "REINCORPORACION", nombre: "REINCORPORACIÓN (Retoma Estudios)" },
                { id: "CAMBIO DE PNF", nombre: "CAMBIO DE PNF" },
                { id: "CAMBIO DE SECCION", nombre: "CAMBIO DE SECCIÓN" },
                { id: "PLAN MULTIMODAL", nombre: "PLAN MULTIMODAL / NIVELACIÓN" },
              ]}
              formik={formik}
            />
            {formik.touched.subtipo_tramite && formik.errors.subtipo_tramite && (
              <p className="text-xs text-red-500 font-medium">
                {formik.errors.subtipo_tramite}
              </p>
            )}
          </div>

          {/* VISTA DINÁMICA: CAMBIO DE PNF */}
          {formik.values.subtipo_tramite === "CAMBIO DE PNF" && (
            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300">
              <div className="flex flex-col justify-end pb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">PNF de Origen actual</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 uppercase">
                  {pnfOrigenEstudiante ? pnfOrigenEstudiante.nombre : "Cargando datos origen..."}
                </span>
              </div>
              <div className="space-y-1 flex flex-col">
                <Label htmlFor="pnf_destino">PNF de Destino</Label>
                <SelectSearch
                  placeholder="Seleccione PNF de Destino"
                  name="pnf_destino"
                  options={listaPnfs
                    .filter((p) => String(p.id) !== String(pnfOrigenEstudiante?.id))
                    .map((p) => ({ id: p.id, nombre: p.nombre }))}
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

          {/* VISTA DINÁMICA: CAMBIO DE SECCIÓN */}
          {formik.values.subtipo_tramite === "CAMBIO DE SECCION" && (
            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300">
              <div className="flex flex-col justify-end pb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Sección de Origen actual</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 uppercase">
                  {seccionOrigenEstudiante ? seccionOrigenEstudiante.nombre : "Cargando datos origen..."}
                </span>
              </div>
              <div className="space-y-1 flex flex-col">
                <Label htmlFor="seccion_destino">Sección de Destino</Label>
                <SelectSearch
                  placeholder="Seleccione Sección de Destino"
                  name="seccion_destino"
                  options={listaSecciones
                    .filter((s) => String(s.id) !== String(seccionOrigenEstudiante?.id))
                    .map((s) => ({ id: s.id, nombre: s.nombre }))}
                  formik={formik}
                />
                {formik.touched.seccion_destino && formik.errors.seccion_destino && (
                  <p className="text-xs text-red-500 font-medium">
                    {formik.errors.seccion_destino}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* VISTA DINÁMICA: PLAN MULTIMODAL */}
          {formik.values.subtipo_tramite === "PLAN MULTIMODAL" && (
            <div className="md:col-span-12 space-y-1 flex flex-col transition-all duration-300">
              <Label htmlFor="asignaturas_pendientes">Asignaturas Pendientes</Label>
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
              {formik.touched.asignaturas_pendientes && formik.errors.asignaturas_pendientes && (
                <p className="text-xs text-red-500 font-medium">
                  {formik.errors.asignaturas_pendientes}
                </p>
              )}
            </div>
          )}

          {/* Observaciones generales text-area */}
          <div className="md:col-span-12 space-y-1 flex flex-col">
            <Label htmlFor="observaciones">Observaciones</Label>
            <ModernTextarea
              id="observaciones"
              name="observaciones"
              placeholder="Ej: El estudiante solicita cambio por motivos laborales o de residencia..."
              onChange={handleUpperCaseChange}
              onBlur={formik.handleBlur}
              value={formik.values.observaciones}
            />
            {formik.touched.observaciones && formik.errors.observaciones && (
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