import { useEffect, useState } from "react";
import { notify } from "@/components/shared/Notify";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionModeTabs from "@/components/shared/PermissionModeTabs";
import CreateRoleForm from "./CreateRolesForm";
import { getAllRolesPermisos } from "@/services/rolService";
import { getAllUsers } from "@/services/userService";
import RoleSection from "./RoleSection";
import UserPermissionSection from "./UserPermissionSection";
import RolesSkeleton from "@/components/shared/RolesSkeleton";

const RolesPermissions = () => {
  const [activeTab, setActiveTab] = useState("role");
  const [view, setView] = useState("list");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Roles & Permisos", href: "/roles" },
  ];

  /* cargar permisos desde la API */
  const fetchRoles = async () => {
    try {
      const roles = await getAllRolesPermisos();
      setRolesList(roles);
      const grouped = roles[0]?.groupedPermissions || {};
      const formattedData = Object.keys(grouped).map((key) => ({
        category: key.toUpperCase(),
        items: grouped[key].map((p) => ({
          id: p.full_name,
          label: p.full_name.split(".")[1] || p.full_name,
        })),
      }));
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching roles:", error);
      notify.error(
        "Error al obtener los roles. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* cargar usuarios */
  const fetchUsers = async () => {
    try {
      const users = await getAllUsers();
      setUsersList(Array.isArray(users) ? users : users?.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      notify.error("Error al obtener los usuarios.");
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  /* Resetear vista al cambiar de tab */
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setView("list");
  };

  if (loading) {
    return (
      <div className="p-8">
        <RolesSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="mb-7 font-sans text-3xl font-semibold">
        Roles & Permisos
      </h1>
      <div className="text-sm text-gray-500 mb-8">
        <BreadcrumbReusable items={breadcrumbItems} />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Toggle By Role / By User - Alineado a la izquierda */}
        <div className="w-full md:w-auto md:translate-y-[7px]">
          <PermissionModeTabs mode={activeTab} onModeChange={handleTabChange} />
        </div>

        {/* Botón de Acción - Solo visible en modo "role" y vista "list" */}
        {activeTab === "role" && view === "list" && (
          <div className="flex justify-end pb-[7px]">
            <Button onClick={() => setView("create")} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Rol
            </Button>
          </div>
        )}
      </div>

      <div className="mt-2">
        {activeTab === "role" ? (
          /* ——— CONTENIDO: POR ROL ——— */
          view === "list" ? (
            <div className="space-y-12">
              {rolesList.map((role) => (
                <RoleSection
                  key={role.id}
                  role={role}
                  permissionsStructure={data}
                />
              ))}
            </div>
          ) : (
            <CreateRoleForm
              permissionsStructure={data}
              onBack={() => setView("list")}
              onSuccess={() => {
                setView("list");
                fetchRoles();
              }}
            />
          )
        ) : (
          /* CONTENIDO: POR USUARIO */
          <UserPermissionSection
            users={usersList}
            permissionsStructure={data}
          />
        )}
      </div>
    </div>
  );
};

export default RolesPermissions;
