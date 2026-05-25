import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { capitalizeWords } from "@/hooks/useCapitalize";

const PermissionGroup = ({
  title,
  permissions = [],
  selectedValues = [],
  setFieldValue,
  roleId = "",
}) => {
  // Identificamos todos los IDs de este grupo
  const groupIds = permissions.map((p) => p.id);

  // Verificamos si todos están marcados
  const isAllSelected =
    groupIds.length > 0 && groupIds.every((id) => selectedValues.includes(id));

  const updateValues = (newValues) => {
    setFieldValue("permisos", newValues);
  };

  const handleSelectAllToggle = (checked) => {
    if (!checked) {
      // Quitar solo los de este grupo
      const newValues = selectedValues.filter((id) => !groupIds.includes(id));
      updateValues(newValues);
    } else {
      // Agregar los de este grupo sin duplicar los que ya estaban fuera de él
      const otherPermissions = selectedValues.filter(
        (id) => !groupIds.includes(id),
      );
      updateValues([...otherPermissions, ...groupIds]);
    }
  };

  return (
    <div className="flex flex-col p-5 space-y-4 border bg-white/50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800 rounded-2xl transition-all hover:shadow-md">
      {/* CABECERA DEL GRUPO CON EL CHECKBOX DISCRETO */}
      <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`select-all-${roleId}-${title}`}
            checked={isAllSelected}
            onCheckedChange={handleSelectAllToggle}
            className="w-4 h-4 border-gray-300 dark:border-slate-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          />
          <Label
            htmlFor={`select-all-${roleId}-${title}`}
            className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 cursor-pointer hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            {title}
          </Label>
        </div>
      </div>

      {/* LISTA DE PERMISOS INDIVIDUALES */}
      <div className="space-y-3">
        {permissions.map((perm) => {
          const isChecked = selectedValues.includes(perm.id);
          const inputId = `perm-${roleId}-${perm.id}`;

          return (
            <div key={perm.id} className="flex items-center space-x-3 group">
              <Checkbox
                id={inputId}
                checked={isChecked}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateValues([...selectedValues, perm.id]);
                  } else {
                    updateValues(selectedValues.filter((id) => id !== perm.id));
                  }
                }}
                className="w-5 h-5 border-gray-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label
                htmlFor={inputId}
                className="text-sm font-medium text-gray-600 dark:text-slate-400 cursor-pointer group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              >
                {capitalizeWords(perm.label)}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionGroup;
