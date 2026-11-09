import React, { useEffect, useState, useMemo } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { ModernInput } from "@/components/shared/InputModerno";
import SelectSearch from "@/components/shared/SelectSearch";
import { Label } from "@/components/ui/label";
import { getLapsoById, updateLapso } from "@/services/lapsoService";
import { DateField } from "@/components/shared/DateField";

export default function EditarLapsoModal({
  isOpen,
  onClose,
  lapsoId,
  onSuccess,
  dataSelect,
}) {
  const [editingLapso, setEditingLapso] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLapso, setLoadingLapso] = useState(false);

  const isActive = useMemo(() => editingLapso?.estado === "activo", [editingLapso]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        nombre_lapso: Yup.string().required("Este campo es obligatorio"),
        ano_academico_id: Yup.string().required("Este campo es obligatorio"),
        tipo_lapso_id: Yup.string().required("Este campo es obligatorio"),
      }),
    [],
  );

  const formik = useFormik({
    initialValues: {
      ano_academico_id: editingLapso?.ano_academico_id || "",
      ano: editingLapso?.ano || "",
      tipo_lapso_id: editingLapso?.tipo_lapso_id || "",
      nombre_lapso: editingLapso?.nombre_lapso || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        setLoading(true);
        const response = await updateLapso(editingLapso.id, values);
        const successMessage =
          response?.message ||
          response?.data?.message ||
          "Lapso actualizado con éxito";
        notify.success(successMessage);
        onSuccess();
        onClose();
        formik.resetForm();
        setEditingLapso(null);
      } catch (error) {
        if (error.response && error.response.status === 422) {
          const laravelErrors = error.response.data.errors;
          const formikErrors = {};

          Object.keys(laravelErrors).forEach((key) => {
            formikErrors[key] = laravelErrors[key][0];
          });

          setErrors(formikErrors);
        } else {
          console.error("Error al actualizar el lapso:", error);
          notify.error(
            "Error al actualizar el lapso por favor, inténtalo de nuevo.",
          );
        }
      } finally {
        setLoading(false);
      }
    },
  });

  // fetch para traer la data del lapso
  useEffect(() => {
    if (isOpen && lapsoId) {
      const fetchLapso = async () => {
        setLoadingLapso(true);
        try {
          const response = await getLapsoById(lapsoId);
          const lapsoData = response.data || response;
          setEditingLapso(lapsoData);
          formik.setValues({
            ano_academico_id: lapsoData.ano_academico_id || "",
            ano: lapsoData.ano || "",
            tipo_lapso_id: lapsoData.tipo_lapso_id || "",
            nombre_lapso: lapsoData.nombre_lapso || "",
          });
        } catch (error) {
          console.error("Error fetching lapso:", error);
          notify.error("Error al cargar los datos del lapso");
          onClose();
        } finally {
          setLoadingLapso(false);
        }
      };
      fetchLapso();
    } else {
      setEditingLapso(null);
      formik.resetForm();
    }
  }, [isOpen, lapsoId]);

  // Actualizar 'ano' con el label del año académico seleccionado
  useEffect(() => {
    if (formik.values.ano_academico_id) {
      const selectedAnoOpt = dataSelect?.anosAptos?.find(
        (opt) => String(opt.id) === String(formik.values.ano_academico_id)
      );
      if (selectedAnoOpt) {
        formik.setFieldValue("ano", String(selectedAnoOpt.ano), false);
      } else if (editingLapso && String(editingLapso.ano_academico_id) === String(formik.values.ano_academico_id)) {
        formik.setFieldValue("ano", editingLapso.ano || "", false);
      } else {
        formik.setFieldValue("ano", "", false);
      }
    } else {
      formik.setFieldValue("ano", "", false);
    }
  }, [formik.values.ano_academico_id, dataSelect?.anosAptos, editingLapso]);

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
      title="Editar Lapso Académico"
      description="Actualiza la información del lapso académico"
      TextButton="Editar Lapso Académico"
      open={isOpen}
      onOpenChange={onClose}
      loadingCargar={loadingLapso}
      loading={loading}
      onSubmit={formik.handleSubmit}
      button={false}
    >
      {/* Select para los Ano Academicos */}
      <div className="md:col-span-3 space-y-1 flex flex-col">
        <Label htmlFor="ano_academico_id">Año Académico</Label>
        <SelectSearch
          name="ano_academico_id"
          options={dataSelect?.anosAptos}
          formik={formik}
          placeholder="Seleccione un año académico"
          labelKey="ano"
          valueKey="id"
          disabled={isActive}
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
          options={dataSelect?.tipoLapsos}
          formik={formik}
          placeholder="Seleccione un tipo de lapso"
          disabled={isActive}
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
    </ModalFormulario>
  );
}
