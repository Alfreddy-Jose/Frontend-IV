import { useState, useEffect, useMemo } from "react";
import { getUserPermissions, updateUserPermissions } from "@/services/userService";
import { notify } from "@/components/shared/Notify";
import SelectSearch from "@/components/shared/SelectSearch";
import PermissionGroup from "@/components/shared/PermissionGroup";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, UserCog, Save } from "lucide-react";

const UserPermissionSection = ({ users = [], permissionsStructure = [] }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mapear usuarios a opciones para SelectSearch
  const userOptions = users.map((u) => ({
    value: u.id,
    label: u.name || u.nombre || `${u.nombre} ${u.apellido || ""}`.trim(),
    ...u,
  }));

  // Adaptador formik-like para que SelectSearch funcione con estado local
  const formikAdapter = useMemo(
    () => ({
      values: { selectedUser: selectedUser?.value ?? "" },
      setFieldValue: (_field, value) => {
        if (!value) {
          setSelectedUser(null);
        } else {
          const option = userOptions.find((o) => o.value === value) || null;
          setSelectedUser(option);
        }
      },
      setFieldTouched: () => {},
    }),
    [selectedUser, userOptions],
  );

  // Cargar permisos del usuario seleccionado
  useEffect(() => {
    if (!selectedUser) {
      setSelectedPermissions([]);
      return;
    }

    const fetchUserPerms = async () => {
      setLoadingPerms(true);
      try {
        const response = await getUserPermissions(selectedUser.value);
        // Estructura: { status, data: { user_id, user_name, all_permissions: ["usuario.crear", ...] } }
        const allPermissions = response?.data?.all_permissions || response?.all_permissions || [];
        setSelectedPermissions(allPermissions);
      } catch (error) {
        console.error("Error cargando permisos del usuario:", error);
        notify.error("Error al cargar los permisos del usuario");
        setSelectedPermissions([]);
      } finally {
        setLoadingPerms(false);
      }
    };

    fetchUserPerms();
  }, [selectedUser]);

  // IDs de todos los permisos posibles
  const allPermissionIds = permissionsStructure.flatMap((group) =>
    group.items.map((i) => i.id),
  );

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

  const handleSave = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      await updateUserPermissions(selectedUser.value, selectedPermissions);
      notify.success(
        `Permisos de ${selectedUser.label} actualizados correctamente`,
      );
    } catch (error) {
      console.error("Error guardando permisos:", error);
      notify.error("Error al actualizar los permisos del usuario");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Buscador de usuarios */}
      <div className="max-w-md">
        <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2 block">
          Seleccionar Usuario
        </Label>
        <SelectSearch
          name="selectedUser"
          options={userOptions}
          formik={formikAdapter}
          valueKey="value"
          labelKey="label"
          placeholder="Buscar usuario..."
          div_style=""
        />
      </div>

      {/* Estado de carga de permisos */}
      {loadingPerms && (
        <div className="flex items-center justify-center py-12 text-gray-400 dark:text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm">Cargando permisos...</span>
        </div>
      )}

      {/* Panel de permisos del usuario seleccionado */}
      {selectedUser && !loadingPerms && (
        <div className="space-y-6 pb-12 border-b border-gray-100 dark:border-slate-800 last:border-0 animate-in fade-in duration-500">
          {/* Header del usuario */}
          <div className="flex flex-col items-start justify-between gap-4 p-6 border-b md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <UserCog className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                  {selectedUser.label}
                </h2>
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  Permisos directos del usuario
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Select All */}
              <div
                className="flex items-center space-x-2 cursor-pointer select-none group"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectAllToggle();
                }}
              >
                <Checkbox
                  id="all-user-perms"
                  checked={isAllSelected}
                />
                <Label className="text-[11px] font-bold uppercase tracking-tight cursor-pointer text-slate-500">
                  Seleccionar Todo
                </Label>
              </div>

              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Grid de permisos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {permissionsStructure.map((group) => (
              <PermissionGroup
                key={group.category}
                title={group.category}
                roleId={`user-${selectedUser.value}`}
                permissions={group.items}
                selectedValues={selectedPermissions}
                setFieldValue={(field, value) => setSelectedPermissions(value)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!selectedUser && !loadingPerms && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-slate-700">
          <UserCog className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-sm font-medium text-gray-400 dark:text-slate-500">
            Selecciona un usuario para gestionar sus permisos
          </p>
        </div>
      )}
    </div>
  );
};

export default UserPermissionSection;
