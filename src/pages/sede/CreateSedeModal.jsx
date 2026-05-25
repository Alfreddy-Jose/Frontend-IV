import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createSede } from "@/services/sedeService";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { ModernInput } from "@/components/shared/InputModerno";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import SelectSearch from "@/components/shared/SelectSearch";
import { useUpperCase } from "@/hooks/useUpperCase";
import { ModernTextarea } from "@/components/shared/ModernTextarea";

export default function CreateSedeModal({ fetchSedes, pnfs, universidad, estados, loadMunicipios }) {
  const [openModal, setOpenModal] = useState(false);
  const [municipios, setMunicipios] = useState([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  const cargarMunicipios = useCallback(async (estadoId) => {
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
  }, [loadMunicipios]);

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
        .required(
          "El nombre abreviado es obligatorio",
        ),
        estado_id: Yup.string().required("El estado es obligatorio"),
        municipio_id: Yup.string().required("El municipio es obligatorio"),
        direccion: Yup.string().required("La dirección es obligatoria"),
      }),
    [],
  );

  // Configuración de Formik
  const formik = useFormik({
    initialValues: {
      nro_sede: "",
      nombre_sede: "",
      nombre_abreviado: "",
      estado_id: "",
      municipio_id: "",
      direccion: "",
      pnf_id: [],
      universidad_id: universidad?.id || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      console.log("Datos para enviar al backend:", values);
      try {
        await createSede(values);
        notify.success("Sede creada exitosamente.");
        // Recargar la lista de usuarios
        fetchSedes();
        // Cerrar el modal
        setOpenModal(false);
        // Aquí puedes resetear el formulario o recargar la lista de usuarios
        formik.resetForm();
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
          console.error("Error al crear la sede:", error);
          notify.error(
            "Error al crear la sede: " +
              (error.response?.data?.message || error.message),
          );
        }
      }
    },
  });

  const { resetForm, setFieldValue, values } = formik;

  useEffect(() => {
    if (!openModal) {
      resetForm();
    }
  }, [openModal, resetForm]);

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
      title="Nueva Sede"
      description="Crear una nueva Sede"
      TextButton="Nueva Sede"
      icon={<PlusIcon />}
      onSubmit={formik.handleSubmit}
      open={openModal}
      onOpenChange={setOpenModal}
      loading={formik.isSubmitting}
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
          <p className="text-xs text-red-500 font-medium">{formik.errors.estado_id}</p>
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
          <p className="text-xs text-red-500 font-medium">{formik.errors.pnf_id}</p>
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
