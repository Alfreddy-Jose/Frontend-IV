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

  const [pnf, setPnf] = useState(() => {
    const storedPnf = localStorage.getItem("pnf");
    return storedPnf || "";
  });

  const [lapsoActual, setLapsoActual] = useState(() => {
    const saved = localStorage.getItem("lapsoActual");
    return saved ? JSON.parse(saved) : null;
  });

  const [lapsos, setLapsos] = useState([]);
  const [permissions, setPermissions] = useState(() => {
    const storedPermissions = localStorage.getItem("permissions");
    try {
      return storedPermissions ? JSON.parse(storedPermissions) : [];
    } catch (e) {
      return [];
    }
  });

  const fetchLapsos = async () => {
    try {
      const response = await getActivosLapsos();
      const lapsosArray = Array.isArray(response) ? response : (response.data || []);
      setLapsos(lapsosArray);
      if (!lapsoActual && lapsosArray.length > 0) {
        setLapsoActual(lapsosArray[0]);
      }
    } catch (err) {
      console.error("Error al obtener los lapsos académicos:", err);
    }
  };

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
          
          if (response.data.pnf) {
            setPnf(response.data.pnf);
            localStorage.setItem("pnf", response.data.pnf);
          }

          await fetchLapsos();
        } catch (err) {
          console.error("Error al obtener los datos del usuario:", err);
        }
      };
      if (!user) {
        fetchUser();
      } else {
        if (lapsos?.length === 0) {
          fetchLapsos();
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (lapsoActual) {
      localStorage.setItem("lapsoActual", JSON.stringify(lapsoActual));
    } else {
      localStorage.removeItem("lapsoActual");
    }
  }, [lapsoActual]);

  // AL INICIAR SESIÓN: No guardamos "token" en localStorage
  const signIn = (userData) => {
    setUser(userData.user);
    setPermissions(userData.permissions || []);
    setPnf(userData.pnf || "");

    localStorage.setItem("user", JSON.stringify(userData.user));
    localStorage.setItem("permissions", JSON.stringify(userData.permissions || []));
    localStorage.setItem("pnf", userData.pnf || "");

    fetchLapsos();
  };

  // AL CERRAR SESIÓN: Limpiamos los datos del usuario de la UI
  const signOut = () => {
    setUser(null);
    setPermissions([]);
    setPnf("");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    localStorage.removeItem("pnf");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        lapsoActual,
        setLapsoActual,
        lapsos,
        pnf,
        setPnf,
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}