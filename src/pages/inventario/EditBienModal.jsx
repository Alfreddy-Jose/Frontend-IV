import { ModernInput } from "@/components/shared/InputModerno";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { notify } from "@/components/shared/Notify";
import { Label } from "@/components/ui/label";
import { updateBien, getBienById } from "@/services/inventarioService";
import { useFormik } from "formik";
import { Pencil } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { useUpperCase } from "@/hooks/useUpperCase";
import SelectSearch from "@/components/shared/SelectSearch"; // <-- Importar el componente SelectSearch

export default function EditBienModal({
  isOpen,
  bienId,
  onClose,
  onSuccess,
  lapsoActual,
  pnfs = [],     // <-- Recibir lista de PNFs
  pnfId = null,  // <-- Recibir pnfId institucional del usuario actual
}) {
  const [fetchingData, setFetchingData] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        // Se exige pnf_id solo si no viene predeterminado por prop pnfId
        pnf_id: pnfId
          ? Yup.mixed().notRequired()
          : Yup.string().required("Este campo es obligatorio"),
        codigo_uni: Yup.string()
          .trim()
          .required("El código de bienes es obligatorio"),
        nombre: Yup.string()
          .trim()
          .required("El nombre del bien es obligatorio"),
        estado_operativo: Yup.string()
          .oneOf(["operativo", "dañado", "desincorporado"], "Selecciona un estado válido")
          .required("El estado operativo es obligatorio"),
        serial: Yup.string().trim().nullable(),
        descripcion: Yup.string().trim().nullable(),
      }),
    [pnfId]
  );

  const formik = useFormik({
    initialValues: {
      codigo_uni: "",
      nombre: "",
      estado_operativo: "operativo",
      serial: "",
      descripcion: "",
      pnf_id: pnfId || "", // <-- Inicializar pnf_id
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        const payload = {
          ...values,
          lapso_academico_id: lapsoActual?.id || null,
        };

        const response = await updateBien(bienId, payload);
        const successMessage =
          response?.message ||
          response?.data?.message ||
          "Bien actualizado con éxito";

        notify.success(successMessage);

        if (onSuccess) {
          onSuccess();
        }

        onClose();
      } catch (error) {
        if (error.response && error.response.status === 422) {
          const laravelErrors = error.response.data.errors;
          const formikErrors = {};
          Object.keys(laravelErrors).forEach((key) => {
            formikErrors[key] = laravelErrors[key][0];
          });
          setErrors(formikErrors);
        } else {
          console.error("Error al actualizar el bien:", error);
          notify.error("Error al actualizar la información del bien.");
        }
      }
    },
  });

  const { handleUpperCaseChange } = useUpperCase(formik);

  // Cargar datos del bien cuando el modal se abre
  useEffect(() => {
    const fetchBienDetails = async () => {
      if (!bienId || !isOpen) return;

      try {
        setFetchingData(true);
        const data = await getBienById(bienId);
        const bienData = data?.data || data;

        const estadoActual =
          bienData?.ultimo_reporte?.estado_operativo ||
          bienData?.estado_operativo ||
          "operativo";

        formik.setValues({
          codigo_uni: bienData?.codigo_uni || "",
          nombre: bienData?.nombre || "",
          estado_operativo: estadoActual,
          serial: bienData?.serial || "",
          descripcion: bienData?.descripcion || "",
          pnf_id: pnfId || bienData?.pnf_id, // <-- Cargar el pnf_id del bien actual o por defecto
        });
      } catch (error) {
        console.error("Error al obtener detalles del bien:", error);
        notify.error("No se pudo cargar la información del bien.");
        onClose();
      } finally {
        setFetchingData(false);
      }
    };

    fetchBienDetails();
  }, [bienId, isOpen, pnfId]);

  // Limpiar formulario al cerrar
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
    }
  }, [isOpen]);

  return (
    <ModalFormulario
      title="Editar Bien / Activo"
      description="Modifica los datos generales del bien"
      TextButton="Guardar Cambios"
      onSubmit={formik.handleSubmit}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      loading={formik.isSubmitting || fetchingData}
      tamaño="sm:max-w-2xl"
    >
      {/* Código Universidad */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="edit-codigo_uni">Código de Bienes (Universidad)</Label>
        <ModernInput
          id="edit-codigo_uni"
          name="codigo_uni"
          placeholder="EJ: C-1029384"
          type="text"
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.codigo_uni}
          className="mb-1"
        />
        {formik.touched.codigo_uni && formik.errors.codigo_uni && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.codigo_uni}
          </p>
        )}
      </div>

      {/* Nombre del Bien */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="edit-nombre">Nombre / Equipo</Label>
        <ModernInput
          id="edit-nombre"
          name="nombre"
          placeholder="EJ: Silla Ejecutiva o Monitor HP 24''"
          type="text"
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.nombre}
          className="mb-1"
        />
        {formik.touched.nombre && formik.errors.nombre && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.nombre}
          </p>
        )}
      </div>

      {/* Select de PNF condicional: Solo si el usuario NO tiene pnfId asociado */}
      {!pnfId && (
        <div className="md:col-span-12 space-y-1 flex flex-col">
          <Label htmlFor="pnf_id">PNF</Label>
          <SelectSearch
            name="pnf_id"
            options={pnfs}
            formik={formik}
            isMulti={false}
            labelKey="nombre"
            valueKey="id"
            placeholder="Seleccione el PNF"
          />
          {formik.touched.pnf_id && formik.errors.pnf_id && (
            <p className="text-xs text-red-500 font-medium">
              {formik.errors.pnf_id}
            </p>
          )}
        </div>
      )}

      {/* Descripción / Características */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="edit-descripcion">
          Descripción / Detalle Técnico{" "}
          <span className="text-xs text-slate-400 font-normal">(Opcional)</span>
        </Label>
        <textarea
          id="edit-descripcion"
          name="descripcion"
          rows={3}
          placeholder="Escriba especificaciones técnicas o detalles del bien..."
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.descripcion}
          className="w-full p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl outline-none border border-transparent focus:border-indigo-500 transition-all text-sm resize-none"
        />
        {formik.touched.descripcion && formik.errors.descripcion && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.descripcion}
          </p>
        )}
      </div>
    </ModalFormulario>
  );
}