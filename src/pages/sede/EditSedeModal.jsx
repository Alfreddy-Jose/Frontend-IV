import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getSedeById, updateSede } from "@/services/sedeService";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { ModernInput } from "@/components/shared/InputModerno";
import { Label } from "@/components/ui/label";
import SelectSearch from "@/components/shared/SelectSearch";
import { useUpperCase } from "@/hooks/useUpperCase";
import { ModernTextarea } from "@/components/shared/ModernTextarea";

export function EditSedeModal({
  isOpen,
  onClose,
  sedeId,
  onSuccess,
  pnfs,
  universidad,
  estados,
  loadMunicipios,
}) {
  const [editingSede, setEditingSede] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSede, setLoadingSede] = useState(false);

  const [municipios, setMunicipios] = useState([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  const cargarMunicipios = useCallback(
    async (estadoId) => {
      if (!estadoId) {
        setMunicipios([]);
        return;
      }

      if (typeof loadMunicipios !== "function") {
        console.error("loadMunicipios no está disponible");
        setMunicipios([]);
        return;
      }

      setLoadingMunicipios(true);
      try {
        const response = await loadMunicipios(estadoId);
        setMunicipios(response);
      } catch (error) {
        console.error("Error al cargar Municipios:", error);
        setMunicipios([]);
      } finally {
        setLoadingMunicipios(false);
      }
    },
    [loadMunicipios]
  );

  // Esquema de Validación con Yup
  const validationSchema = useMemo(
    () =>
      Yup.object({
        nro_sede: Yup.string()
          .matches(/^[0-9]+$/, "Solo se permiten números")
          .required("El número de sede es obligatorio"),
        nombre_sede: Yup.string()
          .matches(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/, "Solo letras permitidas")
          .required("El nombre sede es obligatorio"),
        nombre_abreviado: Yup.string()
          .matches(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/, "Solo letras permitidas")
          .required("El nombre abreviado es obligatorio"),
        estado_id: Yup.string().required("El estado es obligatorio"),
        municipio_id: Yup.string().required("El municipio es obligatorio"),
        direccion: Yup.string().required("La dirección es obligatoria"),
      }),
    []
  );

  // Configuración de Formik
  const formik = useFormik({
    initialValues: {
      nro_sede: editingSede?.nro_sede || "",
      nombre_sede: editingSede?.nombre_sede || "",
      nombre_abreviado: editingSede?.nombre_abreviado || "",
      estado_id: editingSede?.municipio?.estado?.id_estado || "",
      municipio_id: editingSede?.municipio?.id_municipio || "",
      direccion: editingSede?.direccion || "",
      pnf_id: editingSede?.pnfs ? editingSede.pnfs.map((item) => item.pnf_id) : [],
      universidad_id: universidad?.id || editingSede?.universidad_id || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      setLoading(true);
      try {
        const response = await updateSede(editingSede.id, values);
        const messageSuccess = response?.message || response.data?.message || "Sede actualizada exitosamente.";
        notify.success(messageSuccess);
        onSuccess();
        onClose();
        formik.resetForm();
        setEditingSede(null);
      } catch (error) {
        if (error.response && error.response.status === 422) {
          const laravelErrors = error.response.data.errors;
          const formikErrors = {};

          Object.keys(laravelErrors).forEach((key) => {
            formikErrors[key] = laravelErrors[key][0];
          });

          setErrors(formikErrors);
        } else {
          console.error("Error al actualizar la sede:", error);
          notify.error(
            "Error al actualizar la sede: " +
              (error.response?.data?.message || error.message)
          );
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const { resetForm, setFieldValue, values } = formik;

  // Efecto para cargar los datos de la Sede
  useEffect(() => {
    if (isOpen && sedeId) {
      const fetchSede = async () => {
        setLoadingSede(true);
        try {
          const data = await getSedeById(sedeId);
          setEditingSede(data);
        } catch (error) {
          console.error("Error fetching sede:", error);
          notify.error("Error al cargar los datos de la sede");
          onClose();
        } finally {
          setLoadingSede(false);
        }
      };
      fetchSede();
    } else {
      setEditingSede(null);
      resetForm();
      setMunicipios([]);
    }
  }, [isOpen, sedeId, onClose, resetForm]);

  // Efecto para cargar municipios cuando cambia el estado
  useEffect(() => {
    if (values.estado_id) {
      cargarMunicipios(values.estado_id);
    } else {
      setMunicipios([]);
      setFieldValue("municipio_id", "");
    }
  }, [values.estado_id, cargarMunicipios, setFieldValue]);

  // Inicializar el hook de mayúsculas
  const { handleUpperCaseChange } = useUpperCase(formik);

  return (
    <ModalFormulario
      button={false}
      title="Editar Sede"
      description="Editar una Sede existente"
      TextButton="Actualizar Sede"
      onSubmit={formik.handleSubmit}
      open={isOpen}
      onOpenChange={onClose}
      loadingCargar={loadingSede}
      loading={loading || formik.isSubmitting}
    >
      {/* Input Oculto de Universidad */}
      <div className="hidden">
        <Label htmlFor="universidad_id">Universidad</Label>
        <ModernInput
          id="universidad_id"
          name="universidad_id"
          type="text"
          placeholder="Ej: 003"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.universidad_id}
        />
        {formik.errors.universidad_id && formik.touched.universidad_id && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.universidad_id}
          </p>
        )}
      </div>

      {/* Input Número Sede */}
      <div className="md:col-span-3 space-y-1 flex flex-col">
        <Label htmlFor="nro_sede">Número Sede</Label>
        <ModernInput
          id="nro_sede"
          name="nro_sede"
          type="text"
          placeholder="Ej: 300"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.nro_sede}
        />
        {formik.errors.nro_sede && formik.touched.nro_sede && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.nro_sede}
          </p>
        )}
      </div>

      {/* Input Nombre Sede */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <Label htmlFor="nombre_sede">Nombre Sede</Label>
        <ModernInput
          id="nombre_sede"
          name="nombre_sede"
          type="text"
          placeholder="Ej: SEDE CENTRAL"
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.nombre_sede}
        />
        {formik.errors.nombre_sede && formik.touched.nombre_sede && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.nombre_sede}
          </p>
        )}
      </div>

      {/* Input Nombre Abreviado */}
      <div className="md:col-span-3 space-y-1 flex flex-col">
        <Label htmlFor="nombre_abreviado">Nombre Abreviado</Label>
        <ModernInput
          id="nombre_abreviado"
          name="nombre_abreviado"
          type="text"
          placeholder="EJ: SDC"
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.nombre_abreviado}
        />
        {formik.errors.nombre_abreviado && formik.touched.nombre_abreviado && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.nombre_abreviado}
          </p>
        )}
      </div>

      {/* Select Estado */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <Label htmlFor="estado_id">Estado</Label>
        <SelectSearch
          name="estado_id"
          options={estados}
          formik={formik}
          labelKey="estado"
          valueKey="id_estado"
          placeholder="Seleccione un estado"
        />
        {formik.touched.estado_id && formik.errors.estado_id && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.estado_id}
          </p>
        )}
      </div>

      {/* Select Municipio */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <Label htmlFor="municipio_id">Municipio</Label>
        <SelectSearch
          name="municipio_id"
          placeholder={
            !formik.values.estado_id
              ? "Primero seleccione un estado"
              : loadingMunicipios
              ? "Cargando municipios..."
              : municipios?.length === 0
              ? "No hay municipios"
              : "Seleccione un municipio"
          }
          options={municipios}
          labelKey="municipio"
          valueKey="id_municipio"
          value={formik.values.municipio_id}
          formik={formik}
          disabled={
            !formik.values.estado_id ||
            loadingMunicipios ||
            municipios?.length === 0
          }
        />
        {formik.touched.municipio_id && formik.errors.municipio_id && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.municipio_id}
          </p>
        )}
      </div>

      {/* Select para PNFS */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="pnf_id">PNFS</Label>
        <SelectSearch
          name="pnf_id"
          options={pnfs}
          formik={formik}
          isMulti={true}
          labelKey="nombre"
          valueKey="id"
          placeholder="Seleccione una o más opciones"
        />
        {formik.touched.pnf_id && formik.errors.pnf_id && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.pnf_id}
          </p>
        )}
      </div>

      {/* Input Dirección width full */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="direccion">Dirección</Label>
        <ModernTextarea
          id="direccion"
          name="direccion"
          type="text"
          placeholder="EJ: CALLE PRINCIPAL, NÚMERO 123"
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.direccion}
        />
        {formik.errors.direccion && formik.touched.direccion && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.direccion}
          </p>
        )}
      </div>
    </ModalFormulario>
  );
}
