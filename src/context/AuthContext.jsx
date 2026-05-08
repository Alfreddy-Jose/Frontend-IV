/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import Api from "../services/api";
import { getUserData } from "@/services/authService";

const isAuthPage = () => ["/login", "/"].includes(window.location.pathname);
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Nueva función para exponer setUser de forma controlada
  const updateUser = (newUser) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  useEffect(() => {
    if (!isAuthPage()) {
      const fetchUser = async () => {
        try {
          const response = await getUserData(); 
          const userData = response.data.user; 
        setUser(userData);
        // localStorage.setItem("user", JSON.stringify(userData));
        } catch (err) {
          console.error("Error al obtener los datos del usuario:", err);
        }
      };
      fetchUser();
    }
  }, []);

  const signIn = (userData) => {
    setUser(userData.user);
    // Almcenando datos del usuario en el localStorage
    localStorage.setItem("user", JSON.stringify(userData.user));
    // Almcenando token del usuario en el localStorage
    localStorage.setItem("token", userData.token);
    localStorage.setItem("permissions", JSON.stringify(userData.permissions));

    // Configurar el token en las cabeceras de las peticiones API
    Api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("permissions");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        updateUser, // Exponer updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}