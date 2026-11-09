import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  getPerById,
  updatePer,
  getUnidadesCurricularesPorDocente,
} from "@/services/perService";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { ModernInput } from "@/components/shared/InputModerno";
import { Label } from "@/components/ui/label";
import SelectSearch from "@/components/shared/SelectSearch";
import { useUpperCase } from "@/hooks/useUpperCase";

export default function EditPerModal({
  isOpen,
  onClose,
  perId,
  onSuccess,
  Docentes = [],
  Estudiantes = [],
}) {
  const [loadingPer, setLoadingPer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unidadesCurriculares, setUnidadesCurriculares] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  // Normalizar catálogos de entrada
  const docentesOptions = Array.isArray(Docentes)
    ? Docentes
    : Docentes?.docentes ?? [];

  const estudiantesOptions = Array.isArray(Estudiantes)
    ? Estudiantes
    : Estudiantes?.estudiantes ?? [];

  // Esquema de validación Yup
  const validationSchema = useMemo(
    () =>
      Yup.object({
        estudiante_id: Yup.string().required("El estudiante es obligatorio"),
        docente_id: Yup.string().required("El docente es obligatorio"),
        unidad_curricular_id: Yup.string().required(
          "La unidad curricular es obligatoria"
        ),
        calificacion: Yup.number()
          .typeError("Debe ser un número válido")
          .min(0, "Mínimo 0")
          .max(100, "Máximo 100")
          .required("La calificación es obligatoria"),
      }),
    []
  );

  const formik = useFormik({
    initialValues: {
      estudiante_id: "",
      docente_id: "",
      unidad_curricular_id: "",
      calificacion: "",
    },
    validationSchema,
    onSubmit: async (values, { setErrors }) => {
      setLoading(true);
      try {
        const response = await updatePer(perId, values);
        const successMsg =
          response?.message ||
          response?.data?.message ||
          "Registro PER actualizado con éxito";
        notify.success(successMsg);
        onSuccess();
        onClose();
        formik.resetForm();
      } catch (error) {
        if (error.response && error.response.status === 422) {
          const laravelErrors = error.response.data.errors;
          const formikErrors = {};

          Object.keys(laravelErrors).forEach((key) => {
            formikErrors[key] = laravelErrors[key][0];
          });

          setErrors(formikErrors);
        } else {
          console.error("Error al actualizar la PER:", error);
          notify.error("Error al actualizar el registro PER.");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const { handleUpperCaseChange } = useUpperCase(formik);
  const selectedDocenteId = formik.values.docente_id;

  // 1. Cargar datos del PER seleccionado
  useEffect(() => {
    if (isOpen && perId) {
      const fetchPer = async () => {
        setLoadingPer(true);
        try {
          const perData = await getPerById(perId);
          
          // Cargar unidades del docente antes de setear el formulario
          if (perData?.docente_id) {
            const unidades = await getUnidadesCurricularesPorDocente(
              perData.docente_id
            );
            setUnidadesCurriculares(Array.isArray(unidades) ? unidades : []);
          }

          formik.setValues({
            estudiante_id: perData?.estudiante_id || "",
            docente_id: perData?.docente_id || "",
            unidad_curricular_id: perData?.unidad_curricular_id || "",
            calificacion: perData?.calificacion ?? "",
          });
        } catch (error) {
          console.error("Error al cargar PER:", error);
          notify.error("Error al obtener los datos del registro.");
          onClose();
        } finally {
          setLoadingPer(false);
        }
      };
      fetchPer();
    } else {
      formik.resetForm();
      setUnidadesCurriculares([]);
    }
  }, [isOpen, perId]);

  // 2. Cargar UCs cuando cambia manualmente el Docente
  useEffect(() => {
    if (!isOpen || !selectedDocenteId || loadingPer) return;

    const fetchUnidadesDocente = async () => {
      setLoadingUnidades(true);
      try {
        const unidades = await getUnidadesCurricularesPorDocente(
          selectedDocenteId
        );
        setUnidadesCurriculares(Array.isArray(unidades) ? unidades : []);
      } catch (error) {
        console.error("Error al cargar unidades del docente:", error);
        notify.error("Error al obtener las unidades del docente.");
        setUnidadesCurriculares([]);
      } finally {
        setLoadingUnidades(false);
      }
    };

    fetchUnidadesDocente();
  }, [selectedDocenteId]);

  return (
    <ModalFormulario
      button={false}
      title="Editar Registro PER"
      description="Modifique los datos correspondientes de la solicitud de PER"
      loadingCargar={loadingPer}
      loading={loading}
      onSubmit={formik.handleSubmit}
      open={isOpen}
      onOpenChange={(openStatus) => {
        if (!openStatus) {
          onClose();
          formik.resetForm();
          setUnidadesCurriculares([]);
        }
      }}
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
          disabled={true}
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
          disabled={loadingPer || formik.isSubmitting}
        />
        {formik.touched.docente_id && formik.errors.docente_id && (
          <p className="text-xs font-medium text-red-500 mt-1">
            {formik.errors.docente_id}
          </p>
        )}
      </div>

      {/* Unidad Curricular */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <Label htmlFor="unidad_curricular_id">Unidad Curricular</Label>
        <SelectSearch
          id="unidad_curricular_id"
          name="unidad_curricular_id"
          placeholder={
            loadingUnidades
              ? "Cargando unidades..."
              : "Seleccione una unidad curricular"
          }
          formik={formik}
          options={unidadesCurriculares}
          valueKey="id"
          labelKey="nombre"
          disabled={
            loadingPer ||
            formik.isSubmitting ||
            !selectedDocenteId ||
            loadingUnidades
          }
        />
        {formik.touched.unidad_curricular_id &&
          formik.errors.unidad_curricular_id && (
            <p className="text-xs font-medium text-red-500 mt-1">
              {formik.errors.unidad_curricular_id}
            </p>
          )}
      </div>

      {/* Calificación */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <Label htmlFor="calificacion">Calificación</Label>
        <ModernInput
          id="calificacion"
          name="calificacion"
          type="text"
          placeholder="Ej. 16.00"
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.calificacion}
          disabled={loadingPer || formik.isSubmitting}
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

EditPerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  perId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func.isRequired,
  Docentes: PropTypes.array,
  Estudiantes: PropTypes.array,
};