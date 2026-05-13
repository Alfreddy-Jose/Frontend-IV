import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { createPnf } from "@/services/pnfService";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { ModernInput } from "@/components/shared/InputModerno";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { useUpperCase } from "@/hooks/useUpperCase";
import { useCapitalize } from "@/hooks/useCapitalize";
import SelectSearch from "@/components/shared/SelectSearch";

export default function CreatePnfModal({ fetchPnfs, trayectos }) {
  const [openModal, setOpenModal] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        codigo: Yup.string()
          .required("Este campo es obligatorio")
          .matches(/^[0-9]*$/, "Solo números permitidos"),
        nombre: Yup.string().required("Este campo es obligatorio"),
        abreviado: Yup.string()
          .max(4, "Máximo 4 carácteres")
          .required("Este campo es obligatorio"),
        abreviado_coord: Yup.string()
          .max(3, "Máximo 3 carácteres")
          .required("Este campo es obligatorio"),
        trayectos_id: Yup.array().required("Debe seleccionar al menos un trayecto"),
      }),
    [],
  );

  const formik = useFormik({
    initialValues: {
      codigo: "",
      nombre: "",
      abreviado: "",
      abreviado_coord: "",
      trayectos_id: trayectos ? trayectos.map(t => t.id) : [],
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,

    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const response = await createPnf(values);
        const menssageSuccess = response?.message || response?.data?.message || "PNF creado con éxito";
        notify.success(menssageSuccess);
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
    } else {
      // Cuando se abre el modal, seleccionar todos los trayectos por defecto
      if (trayectos && trayectos.length > 0) {
        formik.setFieldValue('trayectos_id', trayectos.map(t => t.id));
      }
    }
  }, [openModal, trayectos]);
  
  // Inicializar el hook de mayúsculas
  const { handleUpperCaseChange } = useUpperCase(formik);

  // Inicializar el hook de capitalización
  const { handleCapitalizeChange } = useCapitalize(formik);

  return (
    <ModalFormulario 
      title="Nuevo Pnf"
      description="Crear un nuevo Pnf"
      TextButton="Nuevo Pnf"
      icon={<PlusIcon />}
      onSubmit={formik.handleSubmit}
      open={openModal}
      onOpenChange={setOpenModal}
      loading={formik.isSubmitting}
    >
      {/* Campos de Input */}
      <div className="space-y-2">
        <Label htmlFor="codigo">Código del Pnf</Label>
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
        <Label htmlFor="nombre">Nombre del Pnf</Label>
        <ModernInput
          id="nombre"
          name="nombre"
          type="text"
          placeholder="Ej: Programa de Formación en Informática"
          onChange={handleCapitalizeChange}
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
        <Label htmlFor="abreviado">Abreviado del Pnf</Label>
        <ModernInput
          id="abreviado"
          name="abreviado"
          type="text"
          placeholder="Ej: PFI"
          onChange={handleUpperCaseChange}
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
          onChange={handleUpperCaseChange}
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

      {/* Select para Trayectos */}
      <div className="space-y-2 col-span-1 md:col-span-2">
        <Label htmlFor="trayectos_id">Trayectos</Label>
        <SelectSearch
          name="trayectos_id"
          options={trayectos}
          formik={formik}
          isMulti={true}
          labelKey="nombre"
          valueKey="id"
          placeholder="Seleccione una o más opciones"
          className="mb-4 w-full"
        />
        {formik.touched.trayectos_id && formik.errors.trayectos_id && (
          <p className="text-xs text-red-500 mt-1">{formik.errors.pnf_id}</p>
        )}
      </div>
    </ModalFormulario>
  );
}
