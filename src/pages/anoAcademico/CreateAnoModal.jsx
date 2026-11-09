import { DateField } from "@/components/shared/DateField";
import { ModernInput } from "@/components/shared/InputModerno";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { notify } from "@/components/shared/Notify";
import { Label } from "@/components/ui/label";
import { createAnoAcademico } from "@/services/anoService";
import { useFormik } from "formik";
import { PlusIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";

export default function CreateAnoModal({ fetchAnos }) {
  const [openModal, setOpenModal] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        ano: Yup.string()
          .matches(/^[0-9]*$/, "Solo números permitidos") // Validación mientras escribe
          .test(
            "longitud",
            "Debe tener 4 dígitos",
            (val) => !val || val.length === 4,
          ) // Solo valida cuando tiene 4
          .required("Este campo es obligatorio"),
        fecha_inicio: Yup.date()
          .transform((value, originalValue) =>
            originalValue === "" || originalValue == null ? null : value,
          )
          .required("Este campo es obligatorio")
          .typeError("Fecha no válida"),
        fecha_fin: Yup.date()
          .transform((value, originalValue) =>
            originalValue === "" || originalValue == null ? null : value,
          )
          .required("Este campo es obligatorio")
          .typeError("Fecha no válida")
          .test(
            "after-fecha-inicio",
            "La fecha de fin debe ser posterior a la fecha de inicio",
            function (value) {
              const { fecha_inicio } = this.parent;
              if (!value || !fecha_inicio) return true;

              const inicio = new Date(fecha_inicio); 
              const fin = new Date(value);
              if (
                Number.isNaN(inicio.getTime()) ||
                Number.isNaN(fin.getTime())
              ) {
                return true;
              }
              return fin > inicio;
            },
          )
          .test(
            "max-un-ano",
            "La fecha de fin no puede ser mayor a un año después de la fecha de inicio",
            function (value) {
              const { fecha_inicio } = this.parent;
              if (!value || !fecha_inicio) return true;

              const inicio = new Date(fecha_inicio);
              const fin = new Date(value);
              if (
                Number.isNaN(inicio.getTime()) ||
                Number.isNaN(fin.getTime())
              ) {
                return true;
              }

              const unAnoDespues = new Date(inicio);
              unAnoDespues.setFullYear(unAnoDespues.getFullYear() + 1);
              return fin <= unAnoDespues;
            },
          ),
      }),
    []
  );

  const formik = useFormik({
    initialValues: {
      ano: "",
      fecha_inicio: "",
      fecha_fin: "",
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const response = await createAnoAcademico(values);
        const successMessage =
          response?.message ||
          response?.data?.message ||
          "Año académico creado con éxito";
        notify.success(successMessage);
        fetchAnos();
        setOpenModal(false);
        resetForm();
      } catch (error) {
        if (error.response && error.response.status === 422) {
          const laravelErrors = error.response.data.errors;
          const formikErrors = {};
          Object.keys(laravelErrors).forEach((key) => {
            formikErrors[key] = laravelErrors[key][0];
          });
          setErrors(formikErrors);
        } else {
          console.error("Error al crear el año académico:", error);
          notify.error("Error al crear el año académico.");
        }
      }
    },
  });

  useEffect(() => {
    if (!openModal) {
      formik.resetForm();
    }
  }, [openModal]);

  return (
    <ModalFormulario
      title="Nuevo Año Académico"
      description="Registrar un nuevo año académico en el sistema"
      TextButton="Nuevo Año"
      icon={<PlusIcon className="mr-2 h-4 w-4" />}
      onSubmit={formik.handleSubmit}
      open={openModal}
      onOpenChange={setOpenModal}
      loading={formik.isSubmitting}
      tamaño="sm:max-w-lg"
    >
      {/* Input Año */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="ano">Año</Label>
        <ModernInput
          id="ano"
          name="ano"
          placeholder="EJ: 2026"
          type="text"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.ano}
          className="mb-1"
        />
        {formik.touched.ano && formik.errors.ano && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.ano}
          </p>
        )}
      </div>

      {/* Input de la fecha de inicio */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <DateField
          id="fecha_inicio"
          name="fecha_inicio"
          label="Fecha de Inicio"
          value={formik.values.fecha_inicio}
          onChange={formik.handleChange}
          error={formik.errors.fecha_inicio}
          touched={formik.touched.fecha_inicio}
        />
      </div>

      {/* Input de la fecha de fin */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
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
      </div>
    </ModalFormulario>
  );
}
