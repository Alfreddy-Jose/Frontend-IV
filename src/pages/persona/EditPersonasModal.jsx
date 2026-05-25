import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as Yup from "yup";
import { useFormik } from "formik";
import { getPersonaById, updatePersona } from "@/services/personaService";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { ModernInput } from "@/components/shared/InputModerno";
import { ModernTextarea } from "@/components/shared/ModernTextarea";
import { Label } from "@/components/ui/label";
import { useUpperCase } from "@/hooks/useUpperCase";
import SelectSearch from "@/components/shared/SelectSearch";

export default function EditPersonasModal({ isOpen, onClose, personaId, onSuccess, estados, loadMunicipios }) {
  const [editingPersona, setEditingPersona] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPersona, setLoadingPersona] = useState(false);
  
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

  // Fetch para traer la data de la Persona al abrir el modal
  useEffect(() => {
    if (isOpen && personaId) {
      const fetchPersona = async () => {
        setLoadingPersona(true);
        try {
          const personaData = await getPersonaById(personaId);
          setEditingPersona(personaData);
        } catch (error) {
          console.error("Error fetching persona:", error);
          notify.error("Error al cargar los datos de la Persona");
          onClose();
        } finally {
          setLoadingPersona(false);
        }
      };
      fetchPersona();
    } else {
      setEditingPersona(null);
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, personaId, onClose]);

  // Esquema de Validación con Yup (Idéntico a CreatePersonasModal)
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
        direccion: Yup.string().nullable(),
        telefono: Yup.string()
          .matches(/^[0-9]*$/, "Solo números permitidos") // Solo números
          .required("Este campo es obligatorio") // Campo requerido
          .min(11, "Mínimo 11 números") // Mínimo 11 números
          .max(11, "Máximo 11 números"), // Máximo 11 números
        email: Yup.string().email("Correo no válido"),
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
      cedula_persona: editingPersona?.cedula_persona || "",
      nombre: editingPersona?.nombre || "",
      apellido: editingPersona?.apellido || "",
      direccion: editingPersona?.direccion || "",
      telefono: editingPersona?.telefono || "",
      email: editingPersona?.email || "",
      tipo_persona: editingPersona?.tipo_persona || "",
      grado_inst: editingPersona?.grado_inst || "",
      estado_id: editingPersona?.municipio?.estado?.id_estado || "",
      municipio_id: editingPersona?.municipio?.id_municipio || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setErrors }) => {
      setLoading(true);
      try {
        const response = await updatePersona(editingPersona.id, values);
        const menssageSuccess = response?.message || response?.data?.message || "Persona actualizada con éxito";
        notify.success(menssageSuccess);
        onSuccess();
        onClose();
        formik.resetForm();
        setEditingPersona(null);
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
          console.error("Error al editar la persona:", error);
          notify.error(
            "Error al editar la persona por favor intente de nuevo.",
          );
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const { values, setFieldValue } = formik;

  // Efecto para cargar municipios cuando cambia el estado
  useEffect(() => {
    if (values.estado_id) {
      cargarMunicipios(values.estado_id);
      
      const originalEstadoId = editingPersona?.municipio?.estado?.id_estado?.toString() || editingPersona?.estado_id?.toString();
      const originalMunicipioId = editingPersona?.municipio?.id_municipio?.toString() || editingPersona?.municipio_id?.toString();

      // Si el usuario cambia el estado manualmente, el estado_id diferirá del original
      // En ese caso, limpiamos el municipio_id para que no quede un municipio inconsistente.
      // Si es la carga inicial o si selecciona el estado_id original nuevamente, se mantiene/resetea al original.
      if (editingPersona && values.estado_id?.toString() !== originalEstadoId) {
        setFieldValue("municipio_id", "");
      } else if (editingPersona && values.estado_id?.toString() === originalEstadoId && !values.municipio_id) {
        // Restaurar municipio original si se vuelve al estado original y está vacío
        setFieldValue("municipio_id", originalMunicipioId);
      }
    } else {
      setMunicipios([]);
      setFieldValue("municipio_id", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.estado_id, cargarMunicipios, setFieldValue, editingPersona]);

  // Inicializar el hook de mayúsculas
  const { handleUpperCaseChange } = useUpperCase(formik);

  return (
    <ModalFormulario
      button={false}
      title="Editar Persona"
      description="Editar una persona existente"
      loadingCargar={loadingPersona}
      loading={loading}
      onSubmit={formik.handleSubmit}
      open={isOpen}
      onOpenChange={onClose}
    >
      {/* Input Cedula */}
      <div className="md:col-span-3 space-y-1 flex flex-col">
        <Label htmlFor="cedula_persona">Cédula</Label>
        <ModernInput
          id="cedula_persona"
          name="cedula_persona"
          type="text"
          placeholder="EJ: 30968595"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.cedula_persona}
          disabled={true}
        />
        {formik.errors.cedula_persona && formik.touched.cedula_persona && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.cedula_persona}
          </p>
        )}
      </div>

      {/* Input Nombre */}
      <div className="md:col-span-4 space-y-1 flex flex-col">
        <Label htmlFor="nombre">Nombre</Label>
        <ModernInput
          id="nombre"
          name="nombre"
          type="text"
          placeholder="EJ: MIGUEL"
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.nombre}
        />
        {formik.errors.nombre && formik.touched.nombre && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.nombre}
          </p>
        )}
      </div>

      {/* Input Apellido */}
      <div className="md:col-span-5 space-y-1 flex flex-col">
        <Label htmlFor="apellido">Apellido</Label>
        <ModernInput
          id="apellido"
          name="apellido"
          type="text"
          placeholder="EJ: PÉREZ"
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.apellido}
        />
        {formik.errors.apellido && formik.touched.apellido && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.apellido}
          </p>
        )}
      </div>

      {/* Input telefono */}
      <div className="md:col-span-4 space-y-1 flex flex-col">
        <Label htmlFor="telefono">Teléfono</Label>
        <ModernInput
          id="telefono"
          name="telefono"
          type="text"
          placeholder="EJ: 04126209176"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.telefono}
        />
        {formik.errors.telefono && formik.touched.telefono && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.telefono}
          </p>
        )}
      </div>

      {/* Input Email */}
      <div className="md:col-span-8 space-y-1 flex flex-col">
        <Label htmlFor="email">Email</Label>
        <ModernInput
          id="email"
          name="email"
          type="text"
          placeholder="EJ: 7F4wP@example.com"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
        />
        {formik.errors.email && formik.touched.email && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.email}
          </p>
        )}
      </div>

      {/* Select para tipo de persona */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <Label htmlFor="tipo_persona">Tipo de Persona</Label>
        <SelectSearch
          placeholder='Seleccione una opción'
          name="tipo_persona"
          options={[
            { id: "ESTUDIANTE", nombre: "ESTUDIANTE" },
            { id: "DOCENTE", nombre: "DOCENTE" },
            { id: "ADMINISTRATIVO", nombre: "ADMINISTRATIVO" },
          ]}
          formik={formik}
        />
        {formik.touched.tipo_persona && formik.errors.tipo_persona && (
          <p className="text-xs text-red-500 font-medium">{formik.errors.tipo_persona}</p>
        )}
      </div>

      {/* Select para grado de instruccion */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <Label htmlFor="grado_inst">Instrucción</Label>
        <SelectSearch
          placeholder='Seleccione una opción'
          name="grado_inst"
          options={[
            { id: "INGENIERO", nombre: "INGENIERO" },
            { id: "LICENCIADO", nombre: "LICENCIADO" },
            { id: "DOCTOR", nombre: "DOCTOR" },
            { id: "TECNICO SUPERIOR", nombre: "TECNICO SUPERIOR" },
            { id: "BACHILLER", nombre: "BACHILLER" },
          ]}
          formik={formik}
        />
        {formik.touched.grado_inst && formik.errors.grado_inst && (
          <p className="text-xs text-red-500 font-medium">{formik.errors.grado_inst}</p>
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
                  ? "No hay municipios disponibles"
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
