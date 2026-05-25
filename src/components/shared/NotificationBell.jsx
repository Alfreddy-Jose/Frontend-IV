import { useState, useEffect } from "react";
import { Bell, Clock } from "lucide-react"; // Importamos Clock para el indicador de tiempo
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { getNotificacions, markAsRead } from "@/services/notifyService";

// 1. IMPORTANTE: Importamos las funciones para el cálculo de tiempo relativo
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// Importa tu contexto de autenticación y tu instancia de echo
import { useAuth } from "@/context/AuthContext";
import echo from "@/services/echo";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth(); // Obtenemos el usuario autenticado para saber su ID
  const [segundero, setSegundero] = useState(0);

  // Agrega este useEffect para que funcione como un reloj automático:
  useEffect(() => {
    // Crea un intervalo que suma 1 al estado cada 60 segundos (60000 ms)
    const intervalo = setInterval(() => {
      setSegundero((prev) => prev + 1);
    }, 60000); 

    // Limpia el intervalo cuando el usuario cierre la app o desmonte el componente
    return () => clearInterval(intervalo);
  }, []);

  // Función reutilizable para cargar las notificaciones desde tu API de Laravel
  const fetchNotifications = async () => {
    try {
      const response = await getNotificacions();
      setNotifications(response || []);
    } catch (error) {
      console.error("Error cargando notificaciones", error);
    }
  };

  // Carga inicial de notificaciones desde tu API de Laravel
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  // ==========================================
  // ESCUCHA EN TIEMPO REAL (WEB_SOCKETS)
  // ==========================================
  useEffect(() => {
    if (!user?.id) return;

    // Nos suscribimos al canal privado nativo de notificaciones de Laravel
    echo.private(`App.Models.User.${user.id}`)
      .notification((notification) => {
        console.log("Nueva notificación capturada en tiempo real:", notification);
        
        // Agregamos la nueva notificación al inicio de la lista instantáneamente
        setNotifications((prev) => [notification, ...prev]);
      });

    // Limpieza de la conexión cuando el componente se desmonte
    return () => {
      echo.leaveChannel(`App.Models.User.${user.id}`);
    };
  }, [user]);

  // Recargar las notificaciones cuando se crea un coordinador (Custom Event local de la pestaña actual)
  useEffect(() => {
    // Escuchamos el evento personalizado en la ventana actual
    window.addEventListener('coordinadorCreado', fetchNotifications);

    // Limpieza al desmontar
    return () => {
      window.removeEventListener('coordinadorCreado', fetchNotifications);
    };
  }, []);

  // Función para limpiar el contador visual al cerrar o abrir el menú
  const marcarComoLeidas = async () => {
    if (!notifications || notifications.length === 0) return;

    try {
      await markAsRead();
      setNotifications([]);
    } catch (error) {
      console.error("Error al marcar como leídas", error);
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => {
      if (!open) {
        marcarComoLeidas();
      }
    }}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative cursor-pointer">
          <Bell className="h-[1.2rem] w-[1.2rem] text-gray-700 dark:text-gray-200" />

          {notifications?.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
              {notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 dark:bg-[#020617] dark:border-slate-800/50">
        <DropdownMenuLabel className="font-bold text-gray-800 dark:text-gray-100">
          Notificaciones
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="dark:bg-slate-800/50" />

        {notifications?.length === 0 ? (
          <p className="text-xs text-gray-400 p-4 text-center">
            No tienes notificaciones nuevas.
          </p>
        ) : (
          notifications.map((notif) => (
            <DropdownMenuItem
              key={notif.id}
              className="cursor-pointer p-3 focus:bg-gray-50 dark:focus:bg-slate-800/50 flex flex-col items-start gap-1 layout-stable"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">
                  {notif.data?.tipo === "registro_usuario" ? "Sistema / Usuario" : "Notificación"}
                </span>

                {/* VISUALIZACIÓN DEL TIEMPO RELATIVO */}
                <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1 font-medium">
                  <Clock className="h-3 w-3" />
                  {(() => {
                    // Mapeo seguro: busca en la raíz o dentro del payload data
                    const fechaRaw = notif.created_at || notif.time || notif.data?.created_at;
                    
                    if (fechaRaw) {
                      return formatDistanceToNow(new Date(fechaRaw), { addSuffix: true, locale: es });
                    }
                    return "Hace unos segundos";
                  })()}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-normal leading-normal mt-1">
                {notif.data?.mensaje}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}