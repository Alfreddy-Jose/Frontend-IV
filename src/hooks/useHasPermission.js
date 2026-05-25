import { useAuth } from "@/context/AuthContext";

export function useHasPermission() {
  const { permissions } = useAuth();

  const hasPermission = (required) => {
    // Si no se requiere ningún permiso, permitir acceso
    if (!required || (Array.isArray(required) && required.length === 0)) {
      return true;
    }
    if (!permissions || permissions.length === 0) {
      return false;
    }

    const requiredArray = Array.isArray(required) ? required : [required];
    // Retorna true si el usuario tiene al menos uno de los permisos requeridos (Lógica OR)
    return requiredArray.some((perm) => permissions.includes(perm));
  };

  return hasPermission;
}
