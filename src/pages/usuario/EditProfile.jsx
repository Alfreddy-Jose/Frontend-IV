import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { ModernInput } from "@/components/shared/InputModerno";
import { notify } from "@/components/shared/Notify";
import { useUpperCase } from "@/hooks/useUpperCase";
import { usePasswordToggle } from "@/hooks/usePasswordToggle";
import { updateUserProfile, updateUserPassword, getUserById } from "@/services/userService";
import { ShieldCheck, User, Loader2, Save, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function EditProfile() {
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { user, updateUser } = useAuth();

  // Estados independientes para mostrar/ocultar cada campo de contraseña
  const [currentPasswordType, toggleCurrentPassword] = usePasswordToggle();
  const [newPasswordType, toggleNewPassword] = usePasswordToggle();
  const [confirmPasswordType, toggleConfirmPassword] = usePasswordToggle();

  // 1. Formik para la información personal
  const profileFormik = useFormik({
    initialValues: {
      name: "",
      email: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .matches(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/, "Solo letras permitidas")
        .required("El nombre es obligatorio"),
      email: Yup.string()
        .email("Email inválido")
        .required("El email es obligatorio"),
    }),
    onSubmit: async (values, { setErrors }) => {
      setLoadingProfile(true);
      try {
        const response = await updateUserProfile(user.id, values);
        const successMessage = response?.message || "Información personal actualizada con éxito";

        // Actualizamos el estado global del usuario (AuthContext) para que
        // Navbar y demás componentes reflejen los cambios de inmediato.
        const updatedUserData = response?.data?.user || response?.user || {
          ...user,
          ...values,
        };
        await updateUser(updatedUserData);

        notify.success(successMessage);
      } catch (error) {
        if (error.response && error.response.status === 422) {
          const laravelErrors = error.response.data.errors;
          const formikErrors = {};
          Object.keys(laravelErrors).forEach((key) => {
            formikErrors[key] = laravelErrors[key][0];
          });
          setErrors(formikErrors);
        } else {
          console.error("Error al actualizar la información personal:", error);
          notify.error("Error al actualizar la información personal. Por favor, inténtalo de nuevo.");
        }
      } finally {
        setLoadingProfile(false);
      }
    },
  });

  // 2. Formik para el cambio de contraseña
  const passwordFormik = useFormik({
    initialValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
    validationSchema: Yup.object({
      current_password: Yup.string().required("La contraseña actual es obligatoria"),
      new_password: Yup.string()
        .min(8, "Al menos 8 caracteres")
        .required("La nueva contraseña es obligatoria"),
      new_password_confirmation: Yup.string()
        .oneOf([Yup.ref("new_password"), null], "Las contraseñas no coinciden")
        .required("Debes confirmar la nueva contraseña"),
    }),
    onSubmit: async (values, { resetForm, setErrors }) => {
      setLoadingPassword(true);
      try {
        const response = await updateUserPassword(user.id, values);
        const successMessage = response?.message || "Contraseña actualizada con éxito";
        notify.success(successMessage);
        resetForm();
      } catch (error) {
        if (error.response && error.response.status === 422) {
          const laravelErrors = error.response.data.errors;
          const formikErrors = {};
          Object.keys(laravelErrors).forEach((key) => {
            formikErrors[key] = laravelErrors[key][0];
          });
          setErrors(formikErrors);
        } else {
          console.error("Error al cambiar la contraseña:", error);
          notify.error("Error al cambiar la contraseña. Verifica tus datos.");
        }
      } finally {
        setLoadingPassword(false);
      }
    },
  });

  // Cargar datos iniciales del perfil
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingData(true);
      try {
        const data = await getUserById(user.id);
        profileFormik.setValues({
          name: data?.name || "",
          email: data?.email || "",
        });
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
        notify.error("Error al cargar los datos del perfil");
      } finally {
        setLoadingData(false);
      }
    };
    fetchProfile();
  }, []);

  const { handleUpperCaseChange } = useUpperCase(profileFormik);

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 dark:text-slate-400">
        Cargando información del perfil...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Cabecera superior (sin botones de guardar) */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-xl backdrop-blur-sm shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Editar Perfil
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Gestiona tu información personal y credenciales de acceso de la institución.
        </p>
      </div>

      {/* Sección 1: Información de Identidad */}
      <form onSubmit={profileFormik.handleSubmit} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-xl space-y-6 shadow-sm">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Información de Identidad
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Detalles visibles para tus compañeros de equipo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Nombre de usuario */}
          <div className="md:col-span-6 space-y-1 flex flex-col">
            <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Nombre del usuario</Label>
            <ModernInput
              id="name"
              name="name"
              type="text"
              placeholder="@alejandromorales"
              onChange={handleUpperCaseChange}
              onBlur={profileFormik.handleBlur}
              value={profileFormik.values.name}
            />
            {profileFormik.touched.name && profileFormik.errors.name && (
              <p className="text-xs text-red-400 font-medium">{profileFormik.errors.name}</p>
            )}
          </div>

          {/* Email del usuario */}
          <div className="md:col-span-6 space-y-1 flex flex-col">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email del usuario</Label>
            <ModernInput
              id="email"
              name="email"
              type="email"
              placeholder="ejemplo@nexus.tech"
              onChange={profileFormik.handleChange}
              onBlur={profileFormik.handleBlur}
              value={profileFormik.values.email}
            />
            {profileFormik.touched.email && profileFormik.errors.email && (
              <p className="text-xs text-red-400 font-medium">{profileFormik.errors.email}</p>
            )}
          </div>
        </div>

        {/* Botón guardar Datos Personales */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/60">
          <Button 
            type="button" 
            variant="outline" 
            title="Cancelar"
            onClick={() => profileFormik.resetForm()}
            className="w-32"
          >
            Cancelar
          </Button>

          
          <Button
            type="submit"
            disabled={loadingProfile}
            className="w-32 flex items-center justify-center gap-2"
          >
            {loadingProfile ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save />
                Guardar
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Sección 2: Seguridad y Contraseña */}
      <form onSubmit={passwordFormik.handleSubmit} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-xl space-y-6 shadow-sm">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Seguridad y Contraseña
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Asegura tu cuenta actualizando periódicamente tus credenciales de cifrado.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-12 space-y-1 flex flex-col">
            <Label htmlFor="current_password" className="text-slate-700 dark:text-slate-300">Contraseña actual</Label>
            <div className="relative">
              <ModernInput
                id="current_password"
                name="current_password"
                type={currentPasswordType}
                placeholder="****************"
                className="[&>input]:pr-12"
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                value={passwordFormik.values.current_password}
              />
              <button
                type="button"
                onClick={() => toggleCurrentPassword()}
                aria-label="Mostrar u ocultar la contraseña actual"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Eye size={18} />
              </button>
            </div>
            {passwordFormik.touched.current_password && passwordFormik.errors.current_password && (
              <p className="text-xs text-red-400 font-medium">{passwordFormik.errors.current_password}</p>
            )}
          </div>

          <div className="md:col-span-6 space-y-1 flex flex-col">
            <Label htmlFor="new_password" className="text-slate-700 dark:text-slate-300">Nueva contraseña</Label>
            <div className="relative">
              <ModernInput
                id="new_password"
                name="new_password"
                type={newPasswordType}
                placeholder="Escribe tu nueva clave"
                className="[&>input]:pr-12"
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                value={passwordFormik.values.new_password}
              />
              <button
                type="button"
                onClick={() => toggleNewPassword()}
                aria-label="Mostrar u ocultar la nueva contraseña"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Eye size={18} />
              </button>
            </div>
            {passwordFormik.touched.new_password && passwordFormik.errors.new_password && (
              <p className="text-xs text-red-400 font-medium">{passwordFormik.errors.new_password}</p>
            )}
          </div>

          <div className="md:col-span-6 space-y-1 flex flex-col">
            <Label htmlFor="new_password_confirmation" className="text-slate-700 dark:text-slate-300">Confirmar nueva contraseña</Label>
            <div className="relative">
              <ModernInput
                id="new_password_confirmation"
                name="new_password_confirmation"
                type={confirmPasswordType}
                placeholder="Repite la nueva clave"
                className="[&>input]:pr-12"
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                value={passwordFormik.values.new_password_confirmation}
              />
              <button
                type="button"
                onClick={() => toggleConfirmPassword()}
                aria-label="Mostrar u ocultar la confirmación de la nueva contraseña"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Eye size={18} />
              </button>
            </div>
            {passwordFormik.touched.new_password_confirmation && passwordFormik.errors.new_password_confirmation && (
              <p className="text-xs text-red-400 font-medium">{passwordFormik.errors.new_password_confirmation}</p>
            )}
          </div>
        </div>

        {/* Botón guardar Contraseña */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/60">
          <Button 
            type="button" 
            variant="outline" 
            title="Cancelar"
            onClick={() => passwordFormik.resetForm()}
            className="w-32"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={loadingPassword}
            className="w-32 flex items-center justify-center gap-2"
          >
            {loadingPassword ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}