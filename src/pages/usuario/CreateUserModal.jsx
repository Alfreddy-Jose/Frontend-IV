import { useMemo, useState, useEffect } from "react";
import { PlusIcon } from "lucide-react";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { createUser } from "@/services/userService";
import * as Yup from "yup";
import { useFormik } from "formik";
import { notify } from "@/components/shared/Notify";
import { Label } from "@/components/ui/label";
import { ModernInput } from "@/components/shared/InputModerno";
import SelectSearch from "@/components/shared/SelectSearch";
import { useUpperCase } from "@/hooks/useUpperCase";

export default function CreateUserModal({ fetchUsers, roles }) {
  const [openModal, setOpenModal] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        name: Yup.string()
          .matches(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/, "Solo letras permitidas")
          .required("Este campo es obligatorio"),
        email: Yup.string().email("Email inválido").required("El email es obligatorio"),
        password: Yup.string().min(6, "Mínimo 6 caracteres").required("La contraseña es obligatoria"),
        rol: Yup.string().required("El rol es obligatorio"), // Validar selección
      }),
    []
  );

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      rol: "",
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const response = await createUser(values);
        const successMessage = response?.message || response?.data?.message || 'Usuario creado con éxito';
        notify.success(successMessage);
        fetchUsers();
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
          console.log("Error al crear el usuario:", error);
          notify.error("Error al crear el usuario.");
        }
      }
    },
  });

  // Mostrar errores después del envío, incluso si el campo no fue tocado.
  const showError = (field) =>
    (formik.touched[field] || formik.submitCount > 0) && Boolean(formik.errors[field]);

  // Reiniciar formulario al cerrar el modal
  useEffect(() => {
    if (!openModal) {
      formik.resetForm();
    }
  }, [openModal]);

  // Inicializar el hook pasando formik
  const { handleUpperCaseChange } = useUpperCase(formik);

  return (
    <ModalFormulario
      title="Nuevo Usuario"
      description="Crear un nuevo usuario"
      TextButton="Nuevo Usuario"
      icon={<PlusIcon />}
      onSubmit={formik.handleSubmit}
      open={openModal}
      onOpenChange={setOpenModal}
      loading={formik.isSubmitting}
    >
      {/* Campos de Input */}
      <div className="md:col-span-5 space-y-1 flex flex-col">
        <Label htmlFor="name">Nombre del Usuario</Label>
        <ModernInput
          id="name"
          name="name"
          placeholder="Ej: ALFREDO"
          type="text"
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
        />
        {showError("name") && (
          <p className="text-xs text-red-500 font-medium">{formik.errors.name}</p>
        )}
      </div>

      {/* Input Email del Usuario */}
      <div className="md:col-span-7 space-y-1 flex flex-col">
        <Label htmlFor="email">Email del Usuario</Label>
        <ModernInput
          id="email"
          name="email"
          type="email"
          placeholder="Ej: alfredo@google.com"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
        />
        {showError("email") && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.email}
          </p>
        )}
      </div>

      {/* Input Contraseña del Usuario */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <Label htmlFor="password">Contraseña del Usuario</Label>
        <ModernInput
          id="password"
          name="password"
          type="password"
          placeholder="Ej: **********"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
        />
        {showError("password") && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.password}
          </p>
        )}
      </div>

      <div className="md:col-span-6 space-y-1 flex flex-col">
        <Label htmlFor="rol">Rol del Usuario</Label>
        <SelectSearch
          name="rol"
          options={roles}
          formik={formik}
          labelKey="name"    
          valueKey="id"
          placeholder="Seleccione un rol"
        />
        {showError("rol") && (
          <p className="text-xs text-red-500 font-medium">{formik.errors.rol}</p>
        )}
      </div>
    </ModalFormulario>
  );
}
