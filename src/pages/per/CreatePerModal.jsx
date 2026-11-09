import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { useFormik } from "formik";
import { PlusIcon } from "lucide-react";
import {
  createPer,
  getUnidadesCurricularesPorDocente,
} from "@/services/perService";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { ModernInput } from "@/components/shared/InputModerno";
import { Label } from "@/components/ui/label";
import SelectSearch from "@/components/shared/SelectSearch";
import { useUpperCase } from "@/hooks/useUpperCase";

export default function CreatePerModal({ fetData, Docentes, Estudiantes }) {
  const [openModal, setOpenModal] = useState(false);

  // Normalizar props: manejar tanto array plano como { docentes: [...] }
  const docentesOptions = Array.isArray(Docentes)
    ? Docentes
    : (Docentes?.docentes ?? []);

  const estudiantesOptions = Array.isArray(Estudiantes)
    ? Estudiantes
    : (Estudiantes?.estudiantes ?? []);

  const [unidadesCurriculares, setUnidadesCurriculares] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  // 1. Esquema de Validación con Yup (igual que en CreateCensoModal)
  const validationSchema = useMemo(
    () =>
      Yup.object({
        estudiante_id: Yup.string().required("El estudiante es obligatorio"),
        unidad_curricular_id: Yup.string().required(
          "La unidad curricular es obligatoria",
        ),
        docente_id: Yup.string().required("El docente es obligatorio"),
        // validar la calificacion que sea decimal con 2 decimales
        calificacion: Yup.number()
          .typeError("Debe ser un número")
          .min(0, "Mínimo 0")
          .max(100, "Máximo 100")
          .required("La calificación es obligatoria"),
      }),
    [],
  );

  const initialValues = {
    estudiante_id: "",
    unidad_curricular_id: "",
    docente_id: "",
    calificacion: "",
  };

  // 2. Manejo de formulario con Formik
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        console.log("Datos para enviar al backend:", values);
        await createPer(values);
        notify.success("Registro creado con éxito");
        fetData();
        setOpenModal(false);
        resetForm();
      } catch (error) {
        // Si el backend (Laravel) devuelve errores de validación (usualmente status 422)
        if (error.response && error.response.status === 422) {
          const laravelErrors = error.response.data.errors;
          const formikErrors = {};

          Object.keys(laravelErrors).forEach((key) => {
            formikErrors[key] = laravelErrors[key][0];
          });

          setErrors(formikErrors);
        } else {
          // Errores generales (500, conexión, etc.)
          console.error("Error al crear la PER:", error);
          notify.error("Error al crear la PER.");
        }
      }
    },
  });

  // 3. Efecto para reaccionar al cambio del Docente Seleccionado
  const selectedDocenteId = formik.values.docente_id;

  useEffect(() => {
    // Si no hay docente seleccionado, limpiar unidades y el valor seleccionado
    if (!selectedDocenteId) {
      setUnidadesCurriculares([]);
      formik.setFieldValue("unidad_curricular_id", "");
      return;
    }

    // Petición HTTP al backend para traer solo las unidades de ese docente
    const fetchUnidadesDocente = async () => {
      setLoadingUnidades(true);
      try {
        const unidades =
        await getUnidadesCurricularesPorDocente(selectedDocenteId);
        setUnidadesCurriculares(Array.isArray(unidades) ? unidades : []);
      } catch (error) {
        console.error("Error al cargar unidades del docente:", error);
        notify.error("Error al cargar las unidades curriculares del docente.");
        setUnidadesCurriculares([]);
      } finally {
        setLoadingUnidades(false);
      }
    };

    // Resetear el campo de unidad curricular cada vez que cambia el docente
    formik.setFieldValue("unidad_curricular_id", "");
    fetchUnidadesDocente();
  }, [selectedDocenteId]);

  // Reiniciar formulario y listas al cerrar el modal
  useEffect(() => {
    if (!openModal) {
      formik.resetForm();
      setUnidadesCurriculares([]);
    }
  }, [openModal]);

  // Transformación reactiva a Mayúsculas
  const { handleUpperCaseChange } = useUpperCase(formik);

  return (
    <ModalFormulario
      title={"Nuevo Registro PER"}
      description={"Ingresa los datos para dar de alta un nuevo registro."}
      TextButton={"Nuevo PER"}
      icon={<PlusIcon />}
      onSubmit={formik.handleSubmit}
      open={openModal}
      onOpenChange={setOpenModal}
      loading={formik.isSubmitting}
    >
      {/* Estudiante */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <Label htmlFor="estudiante_id">Estudiante</Label>
        <SelectSearch
          id="estudiante_id"
          name="estudiante_id"
          placeholder="Seleccione un estudiante"
          formik={formik}
          options={estudiantesOptions.map((e) => ({
            id: e.id,
            nombre: `V-${e.persona?.cedula_persona || ""} - ${e.persona?.nombre || ""} ${e.persona?.apellido || ""}`,
          }))}
          disabled={formik.isSubmitting}
        />
        {formik.touched.estudiante_id && formik.errors.estudiante_id && (
          <p className="text-xs font-medium text-red-500 mt-1">
            {formik.errors.estudiante_id}
          </p>
        )}
      </div>

      {/* Docente */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <Label htmlFor="docente_id">Docente</Label>
        <SelectSearch
          name="docente_id"
          options={docentesOptions}
          formik={formik}
          valueKey="id"
          labelKey="nombre"
          placeholder="Buscar docente"
          disabled={formik.isSubmitting}
        />
        {formik.touched.docente_id &&
          formik.errors.docente_id && (
            <p className="text-xs font-medium text-red-500 mt-1">
              {formik.errors.docente_id}
            </p>
          )}
      </div>

      {/* Unidad Curricular (Poblado dinámicamente según el docente seleccionado) */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <Label htmlFor="unidad_curricular_id">Unidad Curricular</Label>
        <SelectSearch
          id="unidad_curricular_id"
          name="unidad_curricular_id"
          placeholder={
            !selectedDocenteId
              ? "Primero seleccione un docente"
              : loadingUnidades
                ? "Cargando unidades..."
                : "Seleccione una unidad curricular"
          }
          formik={formik}
          options={unidadesCurriculares}
          valueKey="id"
          labelKey="nombre"
          disabled={
            formik.isSubmitting || !selectedDocenteId || loadingUnidades
          }
        />
        {formik.touched.unidad_curricular_id &&
          formik.errors.unidad_curricular_id && (
            <p className="text-xs font-medium text-red-500 mt-1">
              {formik.errors.unidad_curricular_id}
            </p>
          )}
      </div>

      {/* calificacion */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <Label htmlFor="calificacion">Calificacion</Label>
        <ModernInput
          id="calificacion"
          name="calificacion"
          type="text"
          placeholder="Ej. 64.5"
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.calificacion}
          disabled={formik.isSubmitting}
        />
        {formik.touched.calificacion && formik.errors.calificacion && (
          <p className="text-xs font-medium text-red-500 mt-1">
            {formik.errors.calificacion}
          </p>
        )}
      </div>
    </ModalFormulario>
  );
}

CreatePerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  itemToEdit: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};
