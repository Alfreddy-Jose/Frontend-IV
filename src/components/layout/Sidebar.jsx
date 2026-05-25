import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  ShelvingUnit,
  UserRoundKey,
  MapPinHouse,
  CalendarFold,
  FileText,
  Clock3,
  UserRound,
  ListIcon,
  BookOpenTextIcon,
  ChevronDown,
  Cog,
  BookText,
  UserRoundPen,
  UserLock,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useHasPermission } from "@/hooks/useHasPermission";

// Sub-enlaces agrupados bajo "Gestionar Usuarios"
const userManagementLinks = [
  { name: "Roles & Permisos", href: "/roles_permisos", icon: UserRoundKey, requiredPermissions: "rol.ver" },
  { name: "Usuarios", href: "/users", icon: Users, requiredPermissions: "usuario.ver" },
];

// Sub-enlaces agrupados bajo "Configuración Académica"
const academicManagementLinks = [
  { name: "Sede", href: "/sedes", icon: MapPinHouse, requiredPermissions: "sede.ver" },
  { name: "Matrículas", href: "/matriculas", icon: FileText, requiredPermissions: "Tipo Matricula.ver" },
  { name: "Trayectos", href: "/trayectos", icon: Clock3, requiredPermissions: "trayecto.ver" },
  { name: "Unidad Curricular", href: "/unidad_curricular", icon: BookOpenTextIcon, requiredPermissions: "unidad Curricular.ver" },
  { name: "Pnf", href: "/pnfs", icon: BookText, requiredPermissions: "pnf.ver" },
];

const dashboardLink = { name: "dashboard", href: "/", icon: LayoutGrid };

const otherLinks = [
  { name: "Inventario", href: "/inventario", icon: ShelvingUnit, requiredPermissions: "inventario.ver" },
  { name: "Lapso Académico", href: "/lapsos", icon: CalendarFold, requiredPermissions: "lapso.ver" },
  { name: "Secciones", href: "/secciones", icon: ListIcon, requiredPermissions: "seccion.ver" },
  { name: "Control de Entregas", href: "/gestion_entregas", icon: FileText, requiredPermissions: "lapso.ver" },
];

const personsLinks = [
  { name: "Personas", href: "/personas", icon: UserRound, requiredPermissions: "persona.ver" },
  { name: "Docentes", href: "/docentes", icon: UserRound, requiredPermissions: "docente.ver" },
  { name: "Coordinadores", href: "/coordinadores", icon: UserRound, requiredPermissions: "coordinador.ver" },
  { name: "Voceros", href: "/voceros", icon: UserRound, requiredPermissions: "vocero.ver" },
];

export default function Sidebar() {
  const location = useLocation();
  const { isOpen, toggle } = useSidebar();
  const hasPermission = useHasPermission();

  // Filtrado dinámico de enlaces basado en permisos
  const visibleUserLinks = useMemo(() =>
    userManagementLinks.filter((link) => hasPermission(link.requiredPermissions)),
    [hasPermission]
  );

  const visibleAcademicLinks = useMemo(() =>
    academicManagementLinks.filter((link) => hasPermission(link.requiredPermissions)),
    [hasPermission]
  );

  const visibleOtherLinks = useMemo(() =>
    otherLinks.filter((link) => hasPermission(link.requiredPermissions)),
    [hasPermission]
  );

  const visiblePersonsLinks = useMemo(() =>
    personsLinks.filter((link) => hasPermission(link.requiredPermissions)),
    [hasPermission]
  );

  // Auto-abrir si alguna ruta hija visible está activa
  const isUserMgmtActive = visibleUserLinks.some(
    (l) => location.pathname === l.href
  );
  const [userMgmtOpen, setUserMgmtOpen] = useState(isUserMgmtActive);

  // Auto-abrir si alguna ruta académica visible está activa
  const isAcademicMgmtActive = visibleAcademicLinks.some(
    (l) => location.pathname === l.href
  );
  const [academicMgmtOpen, setAcademicMgmtOpen] = useState(isAcademicMgmtActive);

  // Auto-abrir si alguna ruta de personas visible está activa
  const isPersonsActive = visiblePersonsLinks.some(
    (l) => location.pathname === l.href
  );
  const [personsOpen, setPersonsOpen] = useState(isPersonsActive);

  return (
    <>
      <aside
        id="sidebar"
        className={`fixed top-0 left-0 z-20 h-full flex flex-col transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 w-64 bg-white dark:bg-[#020617] border-r`}
        aria-label="Sidebar"
      >
        <div className="relative h-full flex flex-col border-r border-gray-100 bg-white pt-16 dark:bg-[#020617] dark:border-slate-800/50 border-slate-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-1 px-3 bg-white divide-y space-y-1 dark:bg-[#020617]">
              <ul className="space-y-2 pb-2">
                {/* === Dashboard === */}
                <li key={dashboardLink.href}>
                  <Link
                    onClick={() => { if (isOpen) toggle(); }}
                    to={dashboardLink.href}
                    className={`text-sm capitalize font-medium rounded-xl flex items-center p-3 transition-all duration-200 group ${location.pathname === dashboardLink.href
                      ? "bg-indigo-50 text-indigo-700 dark:bg-slate-800/60 dark:text-indigo-300 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/30 dark:hover:text-slate-200"
                      }`}
                  >
                    <LayoutGrid
                      className={`w-5 h-5 mr-3 transition-colors ${location.pathname === dashboardLink.href
                        ? "text-indigo-600 dark:text-indigo-300"
                        : "text-gray-400 group-hover:text-gray-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                        }`}
                    />
                    <span>{dashboardLink.name}</span>
                  </Link>
                </li>

                {/* === Gestionar Usuarios (colapsable) === */}
                {visibleUserLinks.length > 0 && (
                  <li>
                    <button
                      type="button"
                      onClick={() => setUserMgmtOpen((prev) => !prev)}
                      className={`w-full text-sm capitalize font-medium rounded-xl flex items-center p-3 transition-all duration-200 group ${isUserMgmtActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-slate-800/60 dark:text-indigo-300 shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/30 dark:hover:text-slate-200"
                        }`}
                    >
                      <UserLock
                        className={`w-5 h-5 mr-3 transition-colors ${isUserMgmtActive
                          ? "text-indigo-600 dark:text-indigo-300"
                          : "text-gray-400 group-hover:text-gray-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                          }`}
                      />
                      <span>Gestionar Usuarios</span>
                      <ChevronDown
                        className={`w-4 h-4 ml-auto transition-transform duration-300 ${userMgmtOpen ? "rotate-180" : "rotate-0"
                          } ${isUserMgmtActive
                            ? "text-indigo-600 dark:text-indigo-300"
                            : "text-gray-400 group-hover:text-gray-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                          }`}
                      />
                    </button>

                    {/* Sub-opciones con animación */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${userMgmtOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                      <ul className="mt-1 ml-4 space-y-1 border-l border-gray-200 dark:border-slate-700 pl-2">
                        {visibleUserLinks.map((link) => {
                          const isActive = location.pathname === link.href;
                          return (
                            <li key={link.href}>
                              <Link
                                onClick={() => { if (isOpen) toggle(); }}
                                to={link.href}
                                className={`text-sm capitalize font-medium rounded-xl flex items-center p-3 transition-all duration-200 group ${isActive
                                  ? "bg-indigo-50 text-indigo-700 dark:bg-slate-800/60 dark:text-indigo-300 shadow-sm"
                                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/30 dark:hover:text-slate-200"
                                  }`}
                              >
                                <link.icon
                                  className={`w-5 h-5 mr-3 transition-colors ${isActive
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
                  </li>
                )}

                {/* === Resto de enlaces === */}
                {visibleOtherLinks.map((link) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        onClick={() => { if (isOpen) toggle(); }}
                        to={link.href}
                        className={`text-sm capitalize font-medium rounded-xl flex items-center p-3 transition-all duration-200 group ${isActive
                          ? "bg-indigo-50 text-indigo-700 dark:bg-slate-800/60 dark:text-indigo-300 shadow-sm"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/30 dark:hover:text-slate-200"
                          }`}
                      >
                        <link.icon
                          className={`w-5 h-5 mr-3 transition-colors ${isActive
                            ? "text-indigo-600 dark:text-indigo-300"
                            : "text-gray-400 group-hover:text-gray-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                            }`}
                        />
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  );
                })}

                {/* === Gestion de Personas === */}
                {visiblePersonsLinks.length > 0 && (
                  <li>
                    <button
                      type="button"
                      onClick={() => setPersonsOpen((prev) => !prev)}
                      className={`w-full text-sm capitalize font-medium rounded-xl flex items-center p-3 transition-all duration-200 group ${isPersonsActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-slate-800/60 dark:text-indigo-300 shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/30 dark:hover:text-slate-200"
                        }`}
                    >
                      <UserRoundPen
                        className={`w-5 h-5 mr-3 transition-colors ${isPersonsActive
                          ? "text-indigo-600 dark:text-indigo-300"
                          : "text-gray-400 group-hover:text-gray-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                          }`}
                      />
                      <span>Gestionar Personas</span>
                      <ChevronDown
                        className={`w-4 h-4 ml-auto transition-transform duration-300 ${personsOpen ? "rotate-180" : "rotate-0"
                          } ${isPersonsActive
                            ? "text-indigo-600 dark:text-indigo-300"
                            : "text-gray-400 group-hover:text-gray-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                          }`}
                      />
                    </button>

                    {/* Sub-opciones con animación */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${personsOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                      <ul className="mt-1 ml-4 space-y-1 border-l border-gray-200 dark:border-slate-700 pl-2">
                        {visiblePersonsLinks.map((link) => {
                          const isActive = location.pathname === link.href;
                          return (
                            <li key={link.href}>
                              <Link
                                onClick={() => { if (isOpen) toggle(); }}
                                to={link.href}
                                className={`text-sm capitalize font-medium rounded-xl flex items-center p-3 transition-all duration-200 group ${isActive
                                  ? "bg-indigo-50 text-indigo-700 dark:bg-slate-800/60 dark:text-indigo-300 shadow-sm"
                                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/30 dark:hover:text-slate-200"
                                  }`}
                              >
                                <link.icon
                                  className={`w-5 h-5 mr-3 transition-colors ${isActive
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
                  </li>
                )}

                {/* === Configuración Académica (colapsable) === */}
                {visibleAcademicLinks.length > 0 && (
                  <li>
                    <button
                      type="button"
                      onClick={() => setAcademicMgmtOpen((prev) => !prev)}
                      className={`w-full text-sm capitalize font-medium rounded-xl flex items-center p-3 transition-all duration-200 group ${isAcademicMgmtActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-slate-800/60 dark:text-indigo-300 shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/30 dark:hover:text-slate-200"
                        }`}
                    >
                      <Cog
                        className={`w-5 h-5 mr-3 transition-colors ${isAcademicMgmtActive
                          ? "text-indigo-600 dark:text-indigo-300"
                          : "text-gray-400 group-hover:text-gray-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                          }`}
                      />
                      <span>Configuración</span>
                      <ChevronDown
                        className={`w-4 h-4 ml-auto transition-transform duration-300 ${academicMgmtOpen ? "rotate-180" : "rotate-0"
                          } ${isAcademicMgmtActive
                            ? "text-indigo-600 dark:text-indigo-300"
                            : "text-gray-400 group-hover:text-gray-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                          }`}
                      />
                    </button>

                    {/* Sub-opciones con animación */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${academicMgmtOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                      <ul className="mt-1 ml-4 space-y-1 border-l border-gray-200 dark:border-slate-700 pl-2">
                        {visibleAcademicLinks.map((link) => {
                          const isActive = location.pathname === link.href;
                          return (
                            <li key={link.href}>
                              <Link
                                onClick={() => { if (isOpen) toggle(); }}
                                to={link.href}
                                className={`text-sm capitalize font-medium rounded-xl flex items-center p-3 transition-all duration-200 group ${isActive
                                  ? "bg-indigo-50 text-indigo-700 dark:bg-slate-800/60 dark:text-indigo-300 shadow-sm"
                                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/30 dark:hover:text-slate-200"
                                  }`}
                              >
                                <link.icon
                                  className={`w-5 h-5 mr-3 transition-colors ${isActive
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
                  </li>
                )}
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
