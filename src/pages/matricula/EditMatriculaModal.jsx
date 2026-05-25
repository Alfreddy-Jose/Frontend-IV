import React from 'react'
import { useState, useEffect, useMemo } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { ModernInput } from "@/components/shared/InputModerno";
import { Label } from "@/components/ui/label";
import { getMatriculaById, updateMatricula } from '@/services/matriculaService';
import { useCapitalize } from '@/hooks/useCapitalize';

export default function EditMatriculaModal({ isOpen, onClose, matriculaId, onSuccess }) {
  const [editingMatricula, setEditingMatricula] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMatricula, setLoadingMatricula] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        nombre: Yup.string()
          .matches(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/, "Solo letras permitidas") //Solo letras
          .required("Este campo es obligatorio"), // Campo obligatorio
      }),
    [],
  );

  // Formik para editar
  const formik = useFormik({
    initialValues: {
/*       numero: editingMatricula?.numero || "", */
      nombre: editingMatricula?.nombre || "",
    },
    validationSchema,
    onSubmit: async (values, { setErrors }) => {
      setLoading(true);
      try {
        const response = await updateMatricula(editingMatricula.id, values);
        const messageSuccess = response?.message || response?.data?.message;
        notify.success(messageSuccess);
        onSuccess();
        onClose();
        formik.resetForm();
        setEditingMatricula(null);
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
          console.error("Error al editar el Matricula:", error);
          notify.error("Error al editar el Matricula.");
        }
      } finally {
        setLoading(false);
      }
    },
    enableReinitialize: true,
  });

  // Fetch para traer la data de la matricula
  useEffect(() => {
    if (isOpen && matriculaId) {
      const fetchMatriculas = async () => {
        setLoadingMatricula(true);
        try {
          const pnfData = await getMatriculaById(matriculaId);
          setEditingMatricula(pnfData);
        } catch (error) {
          console.error("Error fetching matricula:", error);
          notify.error("Error al cargar los datos del matricula");
          onClose();
        } finally {
          setLoadingMatricula(false);
        }
      };
      fetchMatriculas();
    } else {
      setEditingMatricula(null);
      formik.resetForm();
    }
  }, [isOpen, matriculaId]);

  const { handleCapitalizeChange } = useCapitalize(formik);

  return (
    <ModalFormulario
      button={false}
      title="Editar Pnf"
      description="Editar un pnf existente"
      loadingCargar={loadingMatricula}
      loading={loading}
      onSubmit={formik.handleSubmit}
      open={isOpen}
      onOpenChange={onClose}
    >
      {/* Input para el codigo */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <Label htmlFor="numero">Número de Matricula</Label>
        <ModernInput
          disabled
          readOnly
          id="numero"
          name="numero"
          placeholder="EJ: 12345"
          type="text"
          value={editingMatricula?.numero || ""}
          className="mb-4"
        />
        {formik.touched.numero && formik.errors.numero && (
          <p className="text-xs text-red-500 mt-[-10px] mb-2">
            {formik.errors.numero}
          </p>
        )}
      </div>

      {/* Input Nombre del PNF */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <Label htmlFor="nombre">Nombre de la Matricula</Label>
        <ModernInput
          id="nombre"
          name="nombre"
          type="text"
          placeholder="EJ: REGULAR"
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
    </ModalFormulario>
  );
}
