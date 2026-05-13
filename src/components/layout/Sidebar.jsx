import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  ShelvingUnit,
  UserRoundKey,
  BookOpenText,
  MapPinHouse,
  CalendarFold,
  FileText,
  Clock3,
  UserRound,
} from "lucide-react"; // Importamos los iconos
import { useSidebar } from "@/context/SidebarContext";

const links = [
  { name: "dashboard", href: "/", icon: LayoutGrid },
  { name: "Roles & Permisos", href: "/roles_permisos", icon: UserRoundKey },
  { name: "usuarios", href: "/users", icon: Users },
  { name: "Pnf", href: "/pnfs", icon: BookOpenText },
  { name: "Sede", href: "/sedes", icon: MapPinHouse },
  { name: "Inventario", href: "/inventario", icon: ShelvingUnit },
  { name: "Lapso Académico", href: "/lapsos", icon: CalendarFold },
  { name: "Matrículas", href: "/matriculas", icon: FileText },
  { name: "Trayectos", href: "/trayectos", icon: Clock3 },
  { name: "Personas", href: "/personas", icon: UserRound},
];

export default function Sidebar() {
  const location = useLocation();

  const { isOpen, toggle } = useSidebar();

  return (
    <>
      <aside
        id="sidebar"
        className={`fixed top-0 left-0 z-20 h-full transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 w-64 bg-white dark:bg-[#020617] border-r`}
        aria-label="Sidebar"
      >
        <div className="relative flex-1 flex flex-col min-h-0 border-r border-gray-100 bg-white pt-0 dark:bg-[#020617] dark:border-slate-800/50 border-slate-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-1 px-3 bg-white divide-y space-y-1 dark:bg-[#020617]">
              <ul className="space-y-2 pb-2">
                {links.map((link) => {
                  // Comprobamos si la ruta es la activa
                  const isActive = location.pathname === link.href;

                  return (
                    <li key={link.href}>
                      <Link
                        onClick={() => {
                          if (isOpen) toggle();
                        }}
                        to={link.href}
                        className={`text-sm capitalize font-medium rounded-xl flex items-center p-3 transition-all duration-200 group ${
                          isActive
                            ? // ESTILO ACTIVO
                              "bg-indigo-50 text-indigo-700 dark:bg-slate-800/60 dark:text-indigo-300 shadow-sm"
                            : // ESTILO INACTIVO
                              "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/30 dark:hover:text-slate-200"
                        }`}
                      >
                        {/* Icono de Lucide con color condicional */}
                        <link.icon
                          className={`w-5 h-5 mr-3 transition-colors ${
                            isActive
                              ? "text-indigo-600 dark:text-indigo-300"
                              : "text-gray-400 group-hover:text-gray-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                          }`}
                        />
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </aside>
      {isOpen && (
        <div
          className="bg-gray-900/50 fixed inset-0 z-10 lg:hidden"
          onClick={toggle}
        ></div>
      )}
    </>
  );
}
