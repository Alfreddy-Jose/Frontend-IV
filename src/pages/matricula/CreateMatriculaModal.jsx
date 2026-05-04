import { ModernInput } from "@/components/shared/InputModerno";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { notify } from "@/components/shared/Notify";
import { Label } from "@/components/ui/label";
import { createMatricula } from "@/services/matriculaService";
import { useFormik } from "formik";
import { PlusIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";

export default function CreateMatriculaModal({ fetchMatriculas }) {
  const [openModal, setOpenModal] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        numero: Yup.string()
          .required("Este campo es obligatorio") // Campo obligatorio
          .matches(/^[0-9]*$/, "Solo números permitidos"), // Solo números,
        nombre: Yup.string()
          .matches(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/, "Solo letras permitidas") //Solo letras
          .required("Este campo es obligatorio"), // Campo obligatorio
      }),
    [],
  );

  const formik = useFormik({
    initialValues: {
      numero: "",
      nombre: "",
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,

    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const response = await createMatricula(values);
        const messageSuccess = response?.message || response?.data?.message;
        notify.success(messageSuccess);
        fetchMatriculas();
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
          console.error("Error al crear la matricula:", error);
          notify.error("Error al crear la matricula.");
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


  return (
    <ModalFormulario
      title="Nueva Matrícula"
      description="Crear una nueva Matrícula"
      TextButton="Nueva Matrícula"
      icon={<PlusIcon />}
      onSubmit={formik.handleSubmit}
      open={openModal}
      onOpenChange={setOpenModal}
      loading={formik.isSubmitting}
    >
      {/* Input del numero matricula */}
      <div className="space-y-2">
        <Label htmlFor="numero">Número de la Matrícula</Label>
        <ModernInput
          id="numero"
          name="numero"
          placeholder="Ej: 8"
          type="text"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.numero}
          className="mb-4"
        />
        {formik.touched.numero && formik.errors.numero && (
          <p className="text-xs text-red-500 font-medium mb-3 mt-0">
            {formik.errors.numero}
          </p>
        )}
      </div>

      {/* Input Nombre de Matricula */}
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre de la Matrícula</Label>
        <ModernInput
          id="nombre"
          name="nombre"
          type="text"
          placeholder="Ej: Programa de Formación en Informática"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.nombre}
          className="mb-4"
        />
        {formik.errors.nombre && formik.touched.nombre && (
          <p className="text-xs text-red-500 font-medium mb-3 mt-0">
            {formik.errors.nombre}
          </p>
        )}
      </div>
    </ModalFormulario>
  );
}
