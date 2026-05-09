import { useState } from "react";
import RoleHeader from "@/components/shared/RoleHeader";
import PermissionGroup from "@/components/shared/PermissionGroup";
import { updateRole } from "@/services/rolService";
import { notify } from "@/components/shared/Notify";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const RoleSection = ({ role, permissionsStructure }) => {
  // Inicializamos los permisos marcados con los que ya trae el rol de la BD
  const [selectedPermissions, setSelectedPermissions] = useState(
    role.permissions.map((p) => p.name),
  );

  // Obtener todos los IDs posibles de la estructura
  const allPermissionIds = permissionsStructure.flatMap((group) =>
    group.items.map((i) => i.id),
  );

  // Determinar si todos están seleccionados
  const isAllSelected =
    allPermissionIds.length > 0 &&
    allPermissionIds.every((id) => selectedPermissions.includes(id));

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allPermissionIds);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const dataToUpdate = {
      nombre: role.name,
      permisos: selectedPermissions,
    };
    setIsSaving(true);
    try {
      await updateRole(role.id, dataToUpdate);
      console.log("Permisos actualizados", selectedPermissions);

      notify.success(`Permisos de ${role.name} actualizados`);
    } catch (error) {
      notify.error("Error al actualizar permisos");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 border-b border-gray-100 last:border-0 animate-in fade-in duration-500">
      <RoleHeader
        roleName={role.name}
        actions={
          <div className="flex items-center gap-6">
            {/* Contenedor del Select All */}
            <div
              className="flex items-center space-x-2 cursor-pointer select-none group"
              onClick={(e) => {
                e.preventDefault();
                handleSelectAllToggle();
              }}
            >
              <Checkbox id={`all-${role.id}`} checked={isAllSelected} />
              <Label className="text-[11px] font-bold uppercase tracking-tight cursor-pointer text-slate-500">
                Seleccionar Todo
              </Label>
            </div>

            <Button onClick={() => handleSave(role.id, selectedPermissions)}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {permissionsStructure.map((group) => (
          <PermissionGroup
            key={group.category}
            title={group.category}
            roleId={role.id}
            permissions={group.items}
            selectedValues={selectedPermissions}
            setFieldValue={(field, value) => setSelectedPermissions(value)}
          />
        ))}
      </div>
    </div>
  );
};

export default RoleSection;
