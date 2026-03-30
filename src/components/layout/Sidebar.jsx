import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Users, Bell, UserRoundKey } from "lucide-react"; // Importamos los iconos

const links = [
  { name: "dashboard", href: "/", icon: LayoutGrid },
  { name: "Roles", href: "/roles", icon: UserRoundKey },
  { name: "usuarios", href: "/users", icon: Users },
  { name: "alert", href: "/alert", icon: Bell },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <>
      <aside
        id="sidebar"
        className="fixed hidden z-20 h-full top-0 left-0 pt-16 lg:flex shrink-0 flex-col w-64 transition-width duration-75"
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
      <div
        className="bg-gray-900 opacity-50 hidden fixed inset-0 z-10"
        id="sidebarBackdrop"
      ></div>
    </>
  );
}
