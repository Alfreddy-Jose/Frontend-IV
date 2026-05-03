import React from "react";
import { ShieldCheck, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

const RoleHeader = ({ roleName, description, isSystem, onSave, loading }) => {
  return (
    <div className="flex flex-col items-start justify-between gap-4 p-6 border-b md:flex-row md:items-center border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
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
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center w-full gap-4 md:w-auto">
        {/* Botón Guardar con tus estilos */}
        <Button
          onClick={onSave}
          type="button"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 md:w-auto transition-all active:scale-95"
        >
          {loading ? (
            <span className="flex items-center">
              {/* Puedes poner un icono de loader aquí si tienes uno */}
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Guardando...
            </span>
          ) : (
            <span className="flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RoleHeader;
