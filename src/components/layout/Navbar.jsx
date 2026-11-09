import logoPNFI from "../../assets/logo_gestionAdministrativa_pnfi.png"; 
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "@/services/authService";
import { notify } from "../shared/Notify";
import { useSidebar } from "@/context/SidebarContext"; 
import { Menu, X } from "lucide-react";
import SelectorLapso from "@/components/shared/SelectorLapso";
import NotificationBell from "../shared/NotificationBell";

export default function Navbar() {
  const { setTheme } = useTheme();
  const { user } = useAuth();
  const { signOut } = useAuth();
  const { isOpen, toggle } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const logoutAction = async () => {
      await logout();
      signOut();
      navigate("/login");
    };

    notify.promise(logoutAction(), {
      loading: "Cerrando sesión...",
      success: "Sesión cerrada correctamente",
      error: "Hubo un problema al salir",
    });
  };

  // Traemos el PNF abreviado directo del objeto de desestructuración de useAuth()
  const pnfLimpio = user?.pnf?.abreviado ? user.pnf.abreviado : "";
  // Traemos el nombre del pnf directo del objeto de desestructuración de useAuth()
  const nombrePnf = user?.pnf?.nombre ? user.pnf.nombre : "";

  return (
    <nav className="bg-white border-b border-gray-100 fixed z-30 w-full dark:bg-[#020617] dark:border-slate-800/50">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start gap-2">
            <button
              id="toggleSidebarMobile"
              aria-expanded="true"
              aria-controls="sidebar"
              onClick={toggle}
              className="lg:hidden text-gray-600 hover:text-gray-900 cursor-pointer p-2 hover:bg-gray-100 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100 rounded dark:hover:bg-gray-700 dark:focus:bg-gray-700 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-200" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
              )}
            </button>
            
            {/* NUEVO BLOQUE DE LOGO OPTIMIZADO */}
            <a
              href="#"
              className="flex items-center gap-3 focus:outline-none select-none transition-opacity hover:opacity-90 min-w-0"
            >
              <img 
                src={logoPNFI} 
                alt="Logo PNFI" 
                className="h-11 sm:h-12 w-auto object-contain drop-shadow-sm" 
              />
              <span className="hidden md:block text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-200 whitespace-nowrap">
                SGA
                {pnfLimpio ? (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs ml-1.5 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/40 align-middle cursor-pointer">
                          {pnfLimpio}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="start">
                        <p className="font-normal text-xs">{nombrePnf}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : null}
              </span>
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {/* Selector Lapso */}
            <SelectorLapso />

            {/* Componente de Notificaciones */}
            <NotificationBell />

            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Cambiar tema</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Oscuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  Sistema
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Perfil de Usuario */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-slate-800/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none dark:text-gray-100">
                  {`${!user.name ? "Nombre no disponible" : user.name}`}
                </p>
                <p className="text-[11px] text-gray-400 font-medium mt-1">
                  {!user.roles?.[0].name ? "Rol no disponible" : user.roles?.[0].name}
                </p>
              </div>
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar>
                      <AvatarImage src="" alt="@shadcn" className="grayscale" />
                      <AvatarFallback>
                        {!user.name
                          ? "U"
                          : user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                      </AvatarFallback> 
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* opcion para editar perfil */}
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Perfil</Link>
                    </DropdownMenuItem>
                    {/* opcion para cerrar sesion */}
                    <DropdownMenuItem onClick={handleLogout}>
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}