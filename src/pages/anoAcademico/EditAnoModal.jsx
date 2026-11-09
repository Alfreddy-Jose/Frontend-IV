import { DateField } from "@/components/shared/DateField";
import { ModernInput } from "@/components/shared/InputModerno";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { notify } from "@/components/shared/Notify";
import { Label } from "@/components/ui/label";
import { getAnoById, updateAnoAcademico } from "@/services/anoService";
import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";

export default function EditAnoModal({ isOpen, onClose, anoId, onSuccess }) {
  const [editingAno, setEditingAno] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAno, setLoadingAno] = useState(false);

  // Determinar si el año académico ya está cerrado
  const isClosed = useMemo(() => editingAno?.estado_real === "cerrado", [editingAno]);

  // Determinar si el año académico ya está activo
  const isActive = useMemo(() => editingAno?.estado_real === "activo", [editingAno]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        fecha_inicio: Yup.date()
          .transform((value, originalValue) =>
            originalValue === "" || originalValue == null ? null : value
          )
          .required("Este campo es obligatorio")
          .typeError("Fecha no válida"),
        fecha_fin: Yup.date()
          .transform((value, originalValue) =>
            originalValue === "" || originalValue == null ? null : value
          )
          .required("Este campo es obligatorio")
          .typeError("Fecha no válida")
          .min(
            Yup.ref("fecha_inicio"),
            "La fecha de fin debe ser posterior a la fecha de inicio"
          ),
      }),
    []
  );

  const formik = useFormik({
    initialValues: {
      ano: editingAno?.ano || "",
      fecha_inicio: editingAno?.fecha_inicio || "",
      fecha_fin: editingAno?.fecha_fin || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      if (isClosed) {
        notify.error("No se puede modificar un año académico cerrado.");
        return;
      }
      setLoading(true);
      try {
        const response = await updateAnoAcademico(anoId, values);
        const successMessage =
          response?.message ||
          response?.data?.message ||
          "Año académico actualizado con éxito";
        notify.success(successMessage);
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
          console.error("Error al editar el año académico:", error);
          notify.error("Error al editar el año académico.");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isOpen && anoId) {
      const fetchAno = async () => {
        setLoadingAno(true);
        try {
          const data = await getAnoById(anoId);
          setEditingAno(data.data);
        } catch (error) {
          console.error("Error al cargar los datos del año académico:", error);
          notify.error("Error al cargar los datos del año académico.");
          onClose();
        } finally {
          setLoadingAno(false);
        }
      };
      fetchAno();
    } else {
      setEditingAno(null);
      formik.resetForm();
    }
  }, [isOpen, anoId]);

  return (
    <ModalFormulario
      button={false}
      title="Editar Año Académico"
      description="Modificar las fechas del año académico seleccionado"
      loadingCargar={loadingAno}
      loading={loading}
      onSubmit={formik.handleSubmit}
      open={isOpen}
      onOpenChange={onClose}
      tamaño="sm:max-w-lg"
    >
      {/* Input Año (Deshabilitado y Solo Lectura) */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="ano">Año</Label>
        <ModernInput
          disabled
          readOnly
          id="ano"
          name="ano"
          type="text"
          value={editingAno?.ano || ""}
          className="mb-1 bg-slate-200/50 dark:bg-slate-800/50"
        />
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
          disabled={isActive || isClosed}
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
          disabled={isClosed}
        />
      </div>

      {/* Mensaje de advertencia si está cerrado */}
      {isClosed && (
        <div className="md:col-span-12 mt-2">
          <p className="text-sm text-red-500 font-semibold bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
            Este año académico está cerrado y no admite modificaciones en sus fechas.
          </p>
        </div>
      )}
    </ModalFormulario>
  );
}
