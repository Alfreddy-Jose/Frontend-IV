import { ModernInput } from '@/components/shared/InputModerno';
import { ModalFormulario } from '@/components/shared/ModalFormulario';
import { ModernTextarea } from '@/components/shared/ModernTextarea';
import { notify } from '@/components/shared/Notify';
import SelectSearch from '@/components/shared/SelectSearch';
import { Label } from '@/components/ui/label';
import { useCapitalize } from '@/hooks/useCapitalize';
import { createPersona } from '@/services/personaService';
import { useFormik } from 'formik';
import { PlusIcon } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import * as Yup from "yup";

export default function CreatePersonasModal({ fetchPersona, estados, loadMunicipios }) {
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
        cedula_persona: Yup.string()
          .matches(/^[0-9]*$/, "Solo números permitidos") // Solo números
          .max(8, "Máximo 8 números")
          .min(7, "Mínimo 7 números")
          .required("Este campo es obligatorio"), // Campo requerido
        nombre: Yup.string()
          .matches(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/, "Solo letras permitidas") // solo letras permitidas
          .required("Este campo es obligatorio"), // Campo obligatorio
        apellido: Yup.string()
          .matches(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/, "Solo letras permitidas") // solo letras permitidas
          .required("Este campo es obligatorio"), // Campo requerido
        direccion: Yup.string().required("Este campo es obligatorio"), // Campo requerido
        telefono: Yup.string()
          .matches(/^[0-9]*$/, "Solo números permitidos") // Solo números
          .required("Este campo es obligatorio") // Campo requerido
          .min(11, "Mínimo 11 números") // Mínimo 11 números
          .max(11, "Máximo 11 números"), // Máximo 11 números
        email: Yup.string().email("Correo no válido"),
        //.required("Este campo es obligatorio"),
        tipo_persona: Yup.string().required("Este campo es obligatorio"), // Campo requerido
        grado_inst: Yup.string().required("Este campo es obligatorio"), // Campo requerido
        estado_id: Yup.string().required("Este campo es obligatorio"),
        municipio_id: Yup.string().required("Este campo es obligatorio"),
      }),
    [],
  );

  // Configuración de Formik
  const formik = useFormik({
    initialValues: {
      cedula_persona: "",
      nombre: "",
      apellido: "",
      direccion: "",
      municipio: "",
      telefono: "",
      email: "",
      tipo_persona: "",
      municipio_id: "",
      estado_id: "",
      grado_inst: "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      try {
        const response = await createPersona(values);
        const menssageSuccess = response?.message || response?.data?.message || "Persona creada con éxito";
        notify.success(menssageSuccess);
        // Recargar la lista de usuarios
        fetchPersona();
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

  // Inicializar el hook de capitalización
  const { handleCapitalizeChange } = useCapitalize(formik);

  return (
    <ModalFormulario
      title="Nueva Persona"
      description="Crear una nueva Persona"
      TextButton="Nueva Persona"
      icon={<PlusIcon />}
      onSubmit={formik.handleSubmit}
      open={openModal}
      onOpenChange={setOpenModal}
      loading={formik.isSubmitting}
    >
      {/* Input Cedula */}
      <div className="space-y-2">
        <Label htmlFor="cedula_persona">Cédula</Label>
        <ModernInput
          id="cedula_persona"
          name="cedula_persona"
          type="text"
          placeholder="Ej: 30968595"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.cedula_persona}
          className="mb-4"
        />
        {formik.errors.cedula_persona && formik.touched.cedula_persona && (
          <p className="text-xs text-red-500 font-medium mb-3 mt-0">
            {formik.errors.cedula_persona}
          </p>
        )}
      </div>

      {/* Input Nombre */}
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <ModernInput
          id="nombre"
          name="nombre"
          type="text"
          placeholder="Ej: Miguel"
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

      {/* Input Apellido */}
      <div className="space-y-2">
        <Label htmlFor="apellido">Apellido</Label>
        <ModernInput
          id="apellido"
          name="apellido"
          type="text"
          placeholder="Ej: Pérez"
          onChange={handleCapitalizeChange}
          onBlur={formik.handleBlur}
          value={formik.values.apellido}
          className="mb-4"
        />
        {formik.errors.apellido && formik.touched.apellido && (
          <p className="text-xs text-red-500 font-medium mb-3 mt-0">
            {formik.errors.apellido}
          </p>
        )}
      </div>

      {/* Input telefono */}
      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono</Label>
        <ModernInput
          id="telefono"
          name="telefono"
          type="text"
          placeholder="Ej: 04126209176"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.telefono}
          className="mb-4"
        />
        {formik.errors.telefono && formik.touched.telefono && (
          <p className="text-xs text-red-500 font-medium mb-3 mt-0">
            {formik.errors.telefono}
          </p>
        )}
      </div>

      {/* Input Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <ModernInput
          id="email"
          name="email"
          type="text"
          placeholder="Ej: 7F4wP@example.com"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          className="mb-4"
        />
        {formik.errors.email && formik.touched.email && (
          <p className="text-xs text-red-500 font-medium mb-3 mt-0">
            {formik.errors.email}
          </p>
        )}
      </div>

      {/* Select para tipo de persona */}
      <div className="space-y-2">
        <Label htmlFor="tipo_persona">Tipo de Persona</Label>
        <SelectSearch
          placeholder='Seleccione una opción'
          name="tipo_persona"
          options={[
            { id: "Estudiante", nombre: "Estudiante" },
            { id: "Docente", nombre: "Docente" },
            { id: "Administrativo", nombre: "Administrativo" },
          ]}
          formik={formik}
          className="mb-4"
        />
        {formik.touched.tipo_persona && formik.errors.tipo_persona && (
          <p className="text-xs text-red-500 mt-1">{formik.errors.tipo_persona}</p>
        )}
      </div>

      {/* Select para grado de instruccion */}
      <div className="space-y-2">
        <Label htmlFor="grado_inst">Instrucción</Label>
        <SelectSearch
          placeholder='Seleccione una opción'
          name="grado_inst"
          options={[
            { id: "Ingeniero", nombre: "Ingeniero" },
            { id: "Licenciado", nombre: "Licenciado" },
            { id: "Doctor", nombre: "Doctor" },
            { id: "Tecnico Superior", nombre: "Tecnico Superior" },
            { id: "Bachiller", nombre: "Bachiller" },
          ]}
          formik={formik}
          className="mb-4"
        />
        {formik.touched.grado_inst && formik.errors.grado_inst && (
          <p className="text-xs text-red-500 mt-1">{formik.errors.grado_inst}</p>
        )}
      </div>

      {/* Select Estado */}
      <div className="space-y-2">
        <Label htmlFor="estado_id">Estado</Label>
        <SelectSearch
          name="estado_id"
          options={estados}
          formik={formik}
          labelKey="estado"
          valueKey="id_estado"
          placeholder="Seleccione un estado"
          className="mb-4"
        />
        {formik.touched.estado_id && formik.errors.estado_id && (
          <p className="text-xs text-red-500 mt-1">{formik.errors.estado_id}</p>
        )}
      </div>

      {/* Select Municipio */}
      <div className="space-y-2">
        <Label htmlFor="municipio_id">Municipio</Label>
        <SelectSearch
          name="municipio_id"
          placeholder={
            !formik.values.estado_id
              ? "Primero Seleccione un Estado"
              : loadingMunicipios
                ? "Cargando Municipios..."
                : municipios?.length === 0
                  ? "No hay municipios disponibles"
                  : "Seleccione un Municipio"
          }
          options={municipios}
          labelKey="municipio"
          valueKey="id_municipio"
          value={formik.values.municipio_id}
          formik={formik}
          className="mb-4"
          disabled={
            !formik.values.estado_id ||
            loadingMunicipios ||
            municipios?.length === 0
          }
        />
        {formik.touched.municipio_id && formik.errors.municipio_id && (
          <p className="text-xs text-red-500 mt-1">
            {formik.errors.municipio_id}
          </p>
        )}
      </div>

      {/* Input Dirección width full */}
      <div className="space-y-2">
        <Label htmlFor="direccion">Dirección</Label>
        <ModernTextarea
          id="direccion"
          name="direccion"
          type="text"
          placeholder="Ej: Calle Principal, Número 123"
          onChange={handleCapitalizeChange}
          onBlur={formik.handleBlur}
          value={formik.values.direccion}
          className="mb-4"
        />
        {formik.errors.direccion && formik.touched.direccion && (
          <p className="text-xs text-red-500 font-medium mb-3 mt-0">
            {formik.errors.direccion}
          </p>
        )}
      </div>
    </ModalFormulario>
  );
}
