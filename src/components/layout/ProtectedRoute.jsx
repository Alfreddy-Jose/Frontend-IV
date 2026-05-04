import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation, useParams } from "react-router-dom";


const ProtectedRoute = ({ 
  children, 
  requiredPermission = null,
  allowSelfEdit = false // Prop para permitir edición propia sin permiso completo
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const params = useParams();

  if (!user && location.pathname !== "/login") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se requiere un permiso específico, verificarlo
  if (requiredPermission) {
    const userPermissions = JSON.parse(localStorage.getItem("permissions")) || [];

    // Si el permiso requerido es para editar usuarios y permitimos edición propia
    if (allowSelfEdit && requiredPermission === "usuario.editar") {
      // Verificar si está intentando editar su propio usuario
      const userIdFromUrl = params.id; // Usamos params.id porque la ruta es "/usuario/:id/edit"
      
      if (userIdFromUrl && user && userIdFromUrl === user.id.toString()) {
        // Permitir acceso si está editando su propio usuario
        return children;
      }
    }

    // Si el usuario no tiene el permiso requerido
    if (!userPermissions.includes(requiredPermission)) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
