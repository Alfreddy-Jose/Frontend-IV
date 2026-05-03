import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const PermissionGroup = ({ title, permissions = [], selectedValues = [], setFieldValue }) => {
  
  // Identificamos todos los IDs de este grupo
  const groupIds = permissions.map(p => p.id);
  
  // Verificamos si todos están marcados
  const isAllSelected = groupIds.length > 0 && groupIds.every(id => selectedValues.includes(id));
  
  // Verificamos si hay al menos uno marcado pero no todos (estado indeterminado visual)
  const isAnySelected = groupIds.some(id => selectedValues.includes(id));

  const handleSelectAllToggle = (checked) => {
    if (!checked) {
      const newValues = selectedValues.filter(id => !groupIds.includes(id));
      setFieldValue("permisos", newValues); 
    } else {
      const otherPermissions = selectedValues.filter(id => !groupIds.includes(id));
      setFieldValue("permisos", [...otherPermissions, ...groupIds]); 
    }
};

  return (
    <div className="flex flex-col p-5 space-y-4 border bg-white/50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800 rounded-2xl transition-all hover:shadow-md">
      
      {/* CABECERA DEL GRUPO CON EL CHECKBOX DISCRETO */}
      <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Checkbox 
            id={`select-all-${title}`}
            checked={isAllSelected}
            onCheckedChange={handleSelectAllToggle}
            className="w-4 h-4 border-gray-300 dark:border-slate-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          />
          <Label 
            htmlFor={`select-all-${title}`}
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
          
          return (
            <div key={perm.id} className="flex items-center space-x-3 group">
              <Checkbox
                id={perm.id}
                checked={isChecked}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFieldValue("permisos", [...selectedValues, perm.id]);
                  } else {
                    setFieldValue("permisos", selectedValues.filter(id => id !== perm.id));
                  }
                }}
                className="w-5 h-5 border-gray-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label
                htmlFor={perm.id}
                className="text-sm font-medium text-gray-600 dark:text-slate-400 cursor-pointer group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              >
                {perm.label}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionGroup;