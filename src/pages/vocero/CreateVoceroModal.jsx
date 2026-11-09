import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import SelectSearch from "@/components/shared/SelectSearch";
import { createVocero } from "@/services/voceroService";
import { useAuth } from "@/context/AuthContext";

const TIPOS_VOCERO = [
  { id: "PRINCIPAL", nombre: "PRINCIPAL" },
  { id: "SUPLENTE", nombre: "SUPLENTE" },
];

export default function CreateVoceroModal({
  fetchVoceros,
  estudiantes = [],
  listaSecciones = [],
  loadingEstudiantes = false,
}) {
  const [openModal, setOpenModal] = useState(false);
  const { lapsoActual } = useAuth();

  const validationSchema = useMemo(
    () =>
      Yup.object({
        estudiante_id: Yup.string().required("El estudiante es obligatorio"),
        seccion_id: Yup.string().required("La sección es obligatoria"),
        tipo_vocero: Yup.string().required("El tipo de vocería es obligatorio"),
      }),
    []
  );

  const formik = useFormik({
    initialValues: {
      estudiante_id: "",
      seccion_id: "",
      tipo_vocero: "",
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const payload = {
          estudiante_id: values.estudiante_id,
          seccion_id: values.seccion_id,
          tipo_vocero: values.tipo_vocero,
          lapso_id: lapsoActual?.id,
        };

        await createVocero(payload);

        notify.success("Vocero registrado con éxito");
        resetForm();
        setOpenModal(false);
        fetchVoceros();
      } catch (error) {
        if (error.response && error.response.status === 422) {
          const laravelErrors = error.response.data.errors || {};
          const formikErrors = {};
          Object.keys(laravelErrors).forEach((key) => {
            formikErrors[key] = laravelErrors[key][0];
          });
          setErrors(formikErrors);

          if (error.response.data.message) {
            notify.error(error.response.data.message);
          }
        } else {
          console.error("Error al registrar vocero:", error);
          notify.error("Error al registrar el vocero.");
        }
      }
    },
  });

  const { values, touched, errors, isSubmitting, setFieldValue } = formik;

  useEffect(() => {
    if (!openModal) {
      formik.resetForm();
    }
  }, [openModal]);

  // Formatear opciones de estudiantes
  const opcionesEstudiantes = useMemo(() => {
    return estudiantes.map((e) => {
      const cedula = e.persona?.cedula_persona
        ? `V-${e.persona.cedula_persona} - `
        : "";
      const nombreCompleto = `${e.persona?.nombre || ""} ${e.persona?.apellido || ""}`.trim();

      return {
        id: e.id,
        nombre: `${cedula}${nombreCompleto}`.trim(),
      };
    });
  }, [estudiantes]);

  // Filtrar secciones vinculadas al estudiante seleccionado
  const seccionesDisponibles = useMemo(() => {
    if (!values.estudiante_id) return listaSecciones;

    const estudianteSeleccionado = estudiantes.find(
      (e) => String(e.id) === String(values.estudiante_id)
    );

    if (estudianteSeleccionado && estudianteSeleccionado.secciones?.length > 0) {
      return estudianteSeleccionado.secciones;
    }

    return listaSecciones;
  }, [values.estudiante_id, estudiantes, listaSecciones]);

  // Autoselección de sección
  useEffect(() => {
    if (values.estudiante_id) {
      const estudianteSeleccionado = estudiantes.find(
        (e) => String(e.id) === String(values.estudiante_id)
      );

      if (estudianteSeleccionado?.secciones?.length > 0) {
        // Selecciona la primera sección disponible del estudiante
        setFieldValue("seccion_id", String(estudianteSeleccionado.secciones[0].id));
      } else {
        setFieldValue("seccion_id", "");
      }
    } else {
      setFieldValue("seccion_id", "");
    }
  }, [values.estudiante_id, estudiantes, setFieldValue]);

  // 🔒 Condición para deshabilitar el SelectSearch de sección:
  // Se deshabilita si no se ha seleccionado estudiante O si la sección ya fue autoseleccionada.
  const isSeccionDisabled = !values.estudiante_id || Boolean(values.seccion_id);

  return (
    <ModalFormulario
      title="Designar Vocero"
      description="Asigna un estudiante como vocero de una sección"
      TextButton="Designar Vocero"
      icon={<PlusIcon className="w-4 h-4 mr-1" />}
      open={openModal}
      onOpenChange={setOpenModal}
      onSubmit={formik.handleSubmit}
      loading={isSubmitting}
    >
      {/* Selector de Estudiante */}
      <div className="md:col-span-12 space-y-1 flex flex-col w-full">
        <Label htmlFor="estudiante_id">Estudiante</Label>
        <SelectSearch
          name="estudiante_id"
          options={opcionesEstudiantes}
          formik={formik}
          valueKey="id"
          labelKey="nombre"
          placeholder={
            loadingEstudiantes
              ? "Cargando estudiantes..."
              : "Buscar estudiante por cédula o nombre"
          }
          disabled={loadingEstudiantes}
        />
        {touched.estudiante_id && errors.estudiante_id && (
          <p className="text-xs text-red-500 font-medium">
            {errors.estudiante_id}
          </p>
        )}
      </div>

      {/* Selector de Sección (Disabled si se autoseleccionó) */}
      <div className="md:col-span-6 space-y-1 flex flex-col w-full">
        <Label htmlFor="seccion_id">Sección</Label>
        <SelectSearch
          name="seccion_id"
          options={seccionesDisponibles}
          formik={formik}
          valueKey="id"
          labelKey="nombre"
          placeholder={
            !values.estudiante_id
              ? "Seleccione un estudiante primero"
              : "Sección asignada"
          }
          disabled={isSeccionDisabled}
        />
        {touched.seccion_id && errors.seccion_id && (
          <p className="text-xs text-red-500 font-medium">
            {errors.seccion_id}
          </p>
        )}
      </div>

      {/* Selector de Tipo de Vocería */}
      <div className="md:col-span-6 space-y-1 flex flex-col w-full">
        <Label htmlFor="tipo_vocero">Tipo de Vocería</Label>
        <SelectSearch
          name="tipo_vocero"
          options={TIPOS_VOCERO}
          formik={formik}
          valueKey="id"
          labelKey="nombre"
          placeholder="Seleccionar tipo"
        />
        {touched.tipo_vocero && errors.tipo_vocero && (
          <p className="text-xs text-red-500 font-medium">
            {errors.tipo_vocero}
          </p>
        )}
      </div>
    </ModalFormulario>
  );
}