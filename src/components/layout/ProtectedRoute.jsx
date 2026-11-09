import { useAuth } from "@/context/AuthContext";
import { useHasPermission } from "@/hooks/useHasPermission";
import { Navigate, useLocation, useParams } from "react-router-dom";

const ProtectedRoute = ({
  children,
  requiredPermission = null,
  allowSelfEdit = false // Permite edición propia sin poseer el permiso global administrativo
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const params = useParams();
  const hasPermission = useHasPermission();

  // 1. Si no hay usuario autenticado, redirigir al login
  if (!user && location.pathname !== "/login") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Si la ruta requiere de permisos específicos, evaluamos
  if (requiredPermission) {
    
    // Caso especial: Lógica de Autogestión / Edición propia (Ej: /usuario/:id/edit)
    if (allowSelfEdit && requiredPermission === "usuario.editar") {
      const userIdFromUrl = params.id; // Captura el parámetro de la URL
      
      // Si el ID de la URL coincide con el ID del usuario en sesión, se le concede acceso
      if (userIdFromUrl && user && userIdFromUrl === user.id.toString()) {
        return children;
      }
    }

    // Validación limpia consumiendo la lógica centralizada de tu Hook
    if (!hasPermission(requiredPermission)) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  // 3. Si pasó todas las validaciones anteriores, renderiza la vista solicitada
  return children;
};

export default ProtectedRoute;