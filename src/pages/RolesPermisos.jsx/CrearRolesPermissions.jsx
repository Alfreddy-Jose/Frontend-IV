import { useState } from "react";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PermissionModeTabs from "@/components/shared/PermissionModeTabs";
import CreateRoleFrom from "./CreateRolesForm";

const RolesPermissions = () => {
  const [activeTab, setActiveTab] = useState("role");
  const [view, setView] = useState("list");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Roles & Permisos", href: "/roles" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="mb-7 font-sans text-3xl font-semibold">
        Roles & Permisos
      </h1>
      <div className="text-sm text-gray-500 mb-8">
        <BreadcrumbReusable items={breadcrumbItems} />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Toggle (By Role / By User) - Alineado a la izquierda */}
        <div className="w-full md:w-auto md:translate-y-[7px]">
          <PermissionModeTabs mode={activeTab} onModeChange={setActiveTab} />
        </div>

        {/* Botón de Acción - Alineado a la derecha */}
        {view === "list" && (
          <div className="flex justify-end pb-[7px]">
            <Button
              onClick={() => setView("create")}
              variant="outline"
              >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Rol
            </Button>
          </div>
        )}
      </div>

      {/* 3. ÁREA DE CONTENIDO (Lista o Formulario) */}
      <div className="mt-2">
        {view === "create" ? (
          <CreateRoleFrom
            onBack={() => setView("list")}
            onSuccess={() => setView("list")}
          />
        ) : (
          <div className="p-8 border border-gray-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm min-h-[300px] flex items-center justify-center">
            {/* Aquí iría la lista de roles que diseñaremos después */}
            <p className="text-gray-500">No hay roles creados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesPermissions;
