import React from "react";
import { ShieldCheck, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

const RoleHeader = ({ roleName, isSystem, actions }) => {
  return (
    <div className="flex flex-col items-start justify-between gap-4 p-6 border-b md:flex-row md:items-center">
      <div className="flex items-center gap-4">
        {/* Icono con el estilo de tu sistema */}
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              {roleName}
            </h2>
            {isSystem && (
              <span className="px-2 py-0.5 bg-gray-200 dark:bg-slate-700 text-[10px] font-bold rounded text-gray-500 dark:text-slate-400 uppercase tracking-tight">
                System
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center w-full gap-4 md:w-auto">
        {actions}
      </div>
    </div>
  );
};

export default RoleHeader;
