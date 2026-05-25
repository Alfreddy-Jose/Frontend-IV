import { ModernInput } from '@/components/shared/InputModerno';
import { ModalFormulario } from '@/components/shared/ModalFormulario';
import { notify } from '@/components/shared/Notify';
import { Label } from '@/components/ui/label';
import { createTrayecto } from '@/services/trayectoService';
import { useFormik } from 'formik';
import { PlusIcon } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react'
import * as Yup from "yup";

export default function CreateTrayectoMoldal({ fetchTrayecto }) {
  const [openModal, setOpenModal] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object({
      nombre: Yup.string()
        .required("Este campo es obligatorio") // Campo obligatorio
        .max(1, "Máximo 1 caracter") // Máximo 1 carácteres
        .matches(/^[0-9]*$/, "Solo números permitidos"), // Solo números
      }),
    [],
  );

    const formik = useFormik({
      initialValues: {
        nombre: "",
      },
      validationSchema,
      validateOnBlur: true,
      validateOnChange: true,
  
      onSubmit: async (values, { resetForm, setErrors }) => {
        try {
          const response = await createTrayecto(values);
          const mensaggeSuccess = response?.message || response?.data?.message || 'Trayecto creado con éxito';
          notify.success(mensaggeSuccess);
          fetchTrayecto();
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
            console.error("Error al crear el trayecto:", error);
            notify.error("Error al crear el trayecto.");
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
      title="Nuevo Trayecto"
      description="Crear un nuevo trayecto"
      TextButton="Nuevo Trayecto"
      icon={<PlusIcon />}
      onSubmit={formik.handleSubmit}
      open={openModal}
      onOpenChange={setOpenModal}
      loading={formik.isSubmitting}
      tamaño='sm:max-w-sm'
    >
      {/* Input Nombre del Trayecto */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="nombre">Nombre del Trayecto</Label>
        <ModernInput
          id="nombre"
          name="nombre"
          type="text"
          placeholder="EJ: 1"
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
