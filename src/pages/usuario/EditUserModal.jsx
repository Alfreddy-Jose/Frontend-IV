import { useState, useEffect } from "react";
import { ModalFormulario } from "../../components/shared/ModalFormulario";
import { getUserById, updateUser } from "@/services/userService";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Label } from "@/components/ui/label";
import { ModernInput } from "@/components/shared/InputModerno";
import { notify } from "@/components/shared/Notify";
import SelectSearch from "@/components/shared/SelectSearch";
import { useUpperCase } from "@/hooks/useUpperCase";

export function EditUserModal({ isOpen, onClose, userId, onSuccess, roles }) {
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

  // Esquema de Validación con Yup
  const validationSchema = Yup.object({
    name: Yup.string()
      .matches(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/, "Solo letras permitidas")
      .required("El nombre es obligatorio"),
    email: Yup.string() 
      .email("Email inválido")
      .required("El email es obligatorio"),
    password: Yup.string().min(
      6,
      "La contraseña debe tener al menos 6 caracteres",
    ),
    // rol: Yup.string().required("El rol es obligatorio"),
  });

  // Formik para editar 
  const formik = useFormik({
    initialValues: {
      name: editingUser?.name || "",
      email: editingUser?.email || "",
      password: "",
      rol: editingUser?.rol || "",
    },
    validationSchema,
    onSubmit: async (values, { setErrors }) => {
      setLoading(true);
      try {
        const response = await updateUser(editingUser.id, values);
        const successMessage = response?.message || response?.data?.message || 'Usuario actualizado con éxito';
        notify.success(successMessage);
        onSuccess();
        onClose();
        formik.resetForm();
        setEditingUser(null);
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
          console.error("Error al actualizar el usuario:", error);
          notify.error(
            "Error al actualizar el usuario por favor, inténtalo de nuevo.",
          );
        }
      } finally { 
        setLoading(false);
      }
    },
    enableReinitialize: true,
  });

  // Fetch para traer la data del user
  useEffect(() => {
    if (isOpen && userId) {
      const fetchUser = async () => {
        setLoadingUser(true);
        try {
          const userData = await getUserById(userId);
          setEditingUser(userData);
        } catch (error) {
          console.error("Error fetching user:", error);
          notify.error("Error al cargar los datos del usuario");
          onClose();
        } finally {
          setLoadingUser(false);
        }
      };
      fetchUser();
    } else {
      setEditingUser(null);
      formik.resetForm();
    }
  }, [isOpen, userId]);

  // Inicializar el hook pasando formik
  const { handleUpperCaseChange } = useUpperCase(formik);

  return (
    <ModalFormulario
      button={false}
      title="Editar Usuario"
      description="Editar un usuario existente"
      loadingCargar={loadingUser}
      loading={loading}
      onSubmit={formik.handleSubmit}
      open={isOpen}
      onOpenChange={onClose}
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
        {formik.touched.name && formik.errors.name && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.name}
          </p>
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
        {formik.errors.email && formik.touched.email && (
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
        {formik.errors.password && formik.touched.password && (
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
        {formik.touched.rol && formik.errors.rol && (
          <p className="text-xs text-red-500 font-medium">{formik.errors.rol}</p>
        )}
      </div>
    </ModalFormulario>
  );
}
