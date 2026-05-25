/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import Api from "../services/api";
import { getUserData } from "@/services/authService";
import { getActivosLapsos } from "@/services/lapsoService";

const isAuthPage = () => ["/login", "/"].includes(window.location.pathname);
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });


  // Estado para el lapso académico
  const [lapsoActual, setLapsoActual] = useState(() => {
    const saved = localStorage.getItem("lapsoActual");
    return saved ? JSON.parse(saved) : null;
  });

  const [lapsos, setLapsos] = useState([]);

  // Función para cargar los lapsos disponibles
  const fetchLapsos = async () => {
    try {
      const response = await getActivosLapsos();
      // getActivosLapsos ya retorna response.data de Axios. 
      // Si el backend devuelve un array directo, response será el array.
      // Si el backend devuelve { data: [...] }, response.data será el array.
      const lapsosArray = Array.isArray(response) ? response : (response.data || []);
      setLapsos(lapsosArray);
      if (!lapsoActual && lapsosArray.length > 0) {
        setLapsoActual(lapsosArray[0]);
      }
    } catch (err) {
      console.error("Error al obtener los lapsos académicos:", err);
    }
  };
  const refreshLapsos = async () => {
    try {
      const response = await getActivosLapsos();
      const lapsosArray = Array.isArray(response) ? response : (response.data || []);
      setLapsos(lapsosArray);
      
    } catch (err) {
      console.error("Error al obtener los lapsos académicos:", err);
    }
  };


  const [permissions, setPermissions] = useState(() => {
    const storedPermissions = localStorage.getItem("permissions");
    try {
      return storedPermissions ? JSON.parse(storedPermissions) : [];
    } catch (e) {
      return [];
    }
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
        await fetchLapsos();
        // localStorage.setItem("user", JSON.stringify(userData));
        } catch (err) {
          console.error("Error al obtener los datos del usuario:", err);
        }
      };
      if (!user) {
        fetchUser();
      } else {
        // Si ya hay usuario pero no lapsos, cargarlos
        if (lapsos?.length === 0) {
          fetchLapsos();
        }
      }
    }
  }, [lapsoActual,user]);

  useEffect(() => {
    if (lapsoActual) {
      localStorage.setItem("lapsoActual", JSON.stringify(lapsoActual));
      // Configurar el lapso en los headers de las peticiones API
      Api.defaults.headers.common["X-Lapso-Id"] = lapsoActual.id;
    }
  }, [lapsoActual]);

  const signIn = (userData) => {
    setUser(userData.user);
    setPermissions(userData.permissions || []);
    // Almcenando datos del usuario en el localStorage
    localStorage.setItem("user", JSON.stringify(userData.user));
    // Almcenando token del usuario en el localStorage
    localStorage.setItem("token", userData.token);
    localStorage.setItem("permissions", JSON.stringify(userData.permissions || []));

    // Configurar el token en las cabeceras de las peticiones API
    Api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
    // Cargar lapsos después de iniciar sesión
    fetchLapsos();
  };

  const signOut = () => {
    setUser(null);
    setPermissions([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("permissions");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        lapsoActual,
        setLapsoActual,
        lapsos,
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