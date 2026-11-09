import { ModernInput } from "@/components/shared/InputModerno";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { DateField } from "@/components/shared/DateField";
import { notify } from "@/components/shared/Notify";
import SelectSearch from "@/components/shared/SelectSearch";
import { Label } from "@/components/ui/label";
import { createLapso } from "@/services/lapsoService";
import { useFormik } from "formik";
import { PlusIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";

export default function CreateLapsoModal({ fetchLapsos, dataSelect }) {
  const [openModal, setOpenModal] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        nombre_lapso: Yup.string().required("Este campo es obligatorio"),
        ano_academico_id: Yup.string().required("Este campo es obligatorio"),
        tipo_lapso_id: Yup.string().required("Este campo es obligatorio"),
        // validar que fecha inicio sea menor a la fecha fin y que la fecha fin no sea mayor a un año despues de la fecha inicio
        // fecha_inicio: Yup.date()
        //   .transform((value, originalValue) =>
        //     originalValue === "" || originalValue == null ? null : value,
        //   )
        //   .required("Este campo es obligatorio")
        //   .typeError("Fecha no válida"),
        // fecha_fin: Yup.date()
        //   .transform((value, originalValue) =>
        //     originalValue === "" || originalValue == null ? null : value,
        //   )
        //   .required("Este campo es obligatorio")
        //   .typeError("Fecha no válida")
        //   .test(
        //     "after-fecha-inicio",
        //     "La fecha de fin debe ser posterior a la fecha de inicio",
        //     function (value) {
        //       const { fecha_inicio } = this.parent;
        //       if (!value || !fecha_inicio) return true;

        //       const inicio = new Date(fecha_inicio);
        //       const fin = new Date(value);
        //       if (
        //         Number.isNaN(inicio.getTime()) ||
        //         Number.isNaN(fin.getTime())
        //       ) {
        //         return true;
        //       }
        //       return fin > inicio;
        //     },
        //   )
        //   .test(
        //     "max-un-ano",
        //     "La fecha de fin no puede ser mayor a un año después de la fecha de inicio",
        //     function (value) {
        //       const { fecha_inicio } = this.parent;
        //       if (!value || !fecha_inicio) return true;

        //       const inicio = new Date(fecha_inicio);
        //       const fin = new Date(value);
        //       if (
        //         Number.isNaN(inicio.getTime()) ||
        //         Number.isNaN(fin.getTime())
        //       ) {
        //         return true;
        //       }

        //       const unAnoDespues = new Date(inicio);
        //       unAnoDespues.setFullYear(unAnoDespues.getFullYear() + 1);
        //       return fin <= unAnoDespues;
        //     },
        //   ),
      }),
    [],
  );

  const formik = useFormik({
    initialValues: {
      ano_academico_id: "",
      ano: "",
      tipo_lapso_id: "",
      nombre_lapso: "",
      // fecha_inicio: "",
      // fecha_fin: "",
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const response = await createLapso(values);
        const successMessage =
          response?.message ||
          response?.data?.message ||
          "Lapso creado con éxito";
        notify.success(successMessage);
        fetchLapsos();
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
          console.log("Error al crear el lapsos:", error);
          notify.error("Error al crear el lapsos.");
        }
      }
    },
  });

  // Reiniciar formulario al cerrar el modal
  useEffect(() => {
    if (!openModal) {
      formik.resetForm();
    }
  }, [openModal]);

  // Actualizar 'ano' con el label del año académico seleccionado
  useEffect(() => {
    if (formik.values.ano_academico_id) {
      const selectedAnoOpt = dataSelect.anosAptos?.find(
        (opt) => String(opt.id) === String(formik.values.ano_academico_id)
      );
      formik.setFieldValue("ano", selectedAnoOpt ? String(selectedAnoOpt.ano) : "", false);
    } else {
      formik.setFieldValue("ano", "", false);
    }
  }, [formik.values.ano_academico_id, dataSelect.anosAptos]);

  // Funcion para generar el nombre del LAPSO
  const nombreLapso = useMemo(() => {
    return `${formik.values.ano || ""}${formik.values.tipo_lapso_id || ""}`;
  }, [formik.values.ano, formik.values.tipo_lapso_id]);

  // Establecer el nombre del lapso en el campo
  useEffect(() => {
    formik.setFieldValue("nombre_lapso", nombreLapso, false);
  }, [nombreLapso]);

  return (
    <ModalFormulario
      title="Nuevo Lapso Académico"
      description="Crear un nuevo Lapso Académico"
      TextButton="Nuevo Lapso Académico"
      icon={<PlusIcon />}
      onSubmit={formik.handleSubmit}
      open={openModal}
      onOpenChange={setOpenModal}
      loading={formik.isSubmitting}
    >

      {/* Select para los Ano Academicos */}
      <div className="md:col-span-3 space-y-1 flex flex-col">
        <Label htmlFor="ano_academico_id">Año Académico</Label>
        <SelectSearch
          name="ano_academico_id"
          options={dataSelect.anosAptos}
          formik={formik}
          placeholder="Seleccione un año académico"
          labelKey="ano"
          valueKey="id"
        />
        {formik.touched.ano_academico_id && formik.errors.ano_academico_id && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.ano_academico_id}
          </p>
        )}
      </div>

      {/* Select para los tipos de lapsos */}
      <div className="md:col-span-5 space-y-1 flex flex-col">
        <Label htmlFor="tipo_lapso_id">Tipo de Lapso</Label>
        <SelectSearch
          name="tipo_lapso_id" 
          options={dataSelect.tipoLapsos}
          formik={formik}
          placeholder="Seleccione un tipo de lapso"
        />
        {formik.touched.tipo_lapso_id && formik.errors.tipo_lapso_id && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.tipo_lapso_id}
          </p>
        )}
      </div>

      {/* Input nombre del lapso  */}
      <div className="md:col-span-4 space-y-1 flex flex-col">
        <Label htmlFor="nombre_lapso">Nombre del Lapso</Label>
        <ModernInput
          id="nombre_lapso"
          name="nombre_lapso"
          type="text"
          placeholder="EJ: 2026-7"
          value={formik.values.nombre_lapso}
          readOnly
          disabled
        />
        {formik.errors.nombre_lapso && formik.touched.nombre_lapso && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.nombre_lapso}
          </p>
        )}
      </div>

      {/* Input de la fecha de inicio */}
      {/* <div className="md:col-span-6 space-y-1 flex flex-col">
        <DateField
          id="fecha_inicio"
          name="fecha_inicio"
          label="Fecha de Inicio"
          value={formik.values.fecha_inicio}
          onChange={formik.handleChange}
          error={formik.errors.fecha_inicio}
          touched={formik.touched.fecha_inicio}
        />
      </div> */}

      {/* Input de la fecha de fin */}
      {/* <div className="md:col-span-6 space-y-1 flex flex-col">
        <DateField
          id="fecha_fin"
          name="fecha_fin"
          label="Fecha de Fin"
          value={formik.values.fecha_fin}
          onChange={formik.handleChange}
          error={formik.errors.fecha_fin}
          touched={formik.touched.fecha_fin}
          min={formik.values.fecha_inicio || undefined}
        />
      </div> */}
    </ModalFormulario>
  );
}
