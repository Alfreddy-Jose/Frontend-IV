import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { createPnf } from "@/services/pnfService";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { ModernInput } from "@/components/shared/InputModerno";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";

export default function CreatePnfModal({ fetchPnfs }) {
  const [openModal, setOpenModal] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        codigo: Yup.string()
          .required("Este campo es obligatorio")
          .matches(/^[0-9]*$/, "Solo números permitidos"),
        nombre: Yup.string().required("Este campo es obligatorio"),
        abreviado: Yup.string()
          .min(4, "Minimo 4 carácteres")
          .required("Este campo es obligatorio"),
        abreviado_coord: Yup.string()
          .min(3, "Minimo 3 carácteres")
          .required("Este campo es obligatorio"),
      }),
    [],
  );

  const formik = useFormik({
    initialValues: {
      codigo: "",
      nombre: "",
      abreviado: "",
      abreviado_coord: "",
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,

    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        console.log("Datos para enviar al backend:", values);
        await createPnf(values);
        notify.success("PNF creado con éxito");
        fetchPnfs();
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
          console.error("Error al crear el pnf:", error);
          notify.error("Error al crear el pnf.");
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
      title="Nuevo PNF"
      description="Crear un nuevo PNF"
      TextButton="Nuevo PNF"
      icon={<PlusIcon />}
      onSubmit={formik.handleSubmit}
      open={openModal}
      onOpenChange={setOpenModal}
      loading={formik.isSubmitting}
    >
      {/* Campos de Input */}
      <div className="space-y-2">
        <Label htmlFor="codigo">Código del PNF</Label>
        <ModernInput
          id="codigo"
          name="codigo"
          placeholder="Ej: 12345"
          type="text"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.codigo}
          className="mb-4"
        />
        {formik.touched.codigo && formik.errors.codigo && (
          <p className="text-xs text-red-500 mt-[-10px] mb-2">
            {formik.errors.codigo}
          </p>
        )}
      </div>

      {/* Input Nombre del PNF */}
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre del PNF</Label>
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

      {/* Input Abreviado del PNF */}
      <div className="space-y-2">
        <Label htmlFor="abreviado">Abreviado del PNF</Label>
        <ModernInput
          id="abreviado"
          name="abreviado"
          type="text"
          placeholder="Ej: PFI"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.abreviado}
          className="mb-4"
        />
        {formik.errors.abreviado && formik.touched.abreviado && (
          <p className="text-xs text-red-500 font-medium mb-3 mt-0">
            {formik.errors.abreviado}
          </p>
        )}
      </div>

      {/* Input Abreviado del Coordinador */}
      <div className="space-y-2">
        <Label htmlFor="abreviado_coord">Abreviado Coordinación</Label>
        <ModernInput
          id="abreviado_coord"
          name="abreviado_coord"
          type="text"
          placeholder="Ej: PFI-CO"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.abreviado_coord}
          className="mb-4"
        />
        {formik.errors.abreviado_coord && formik.touched.abreviado_coord && (
          <p className="text-xs text-red-500 font-medium mb-3 mt-0">
            {formik.errors.abreviado_coord}
          </p>
        )}
      </div>
    </ModalFormulario>
  );
}
