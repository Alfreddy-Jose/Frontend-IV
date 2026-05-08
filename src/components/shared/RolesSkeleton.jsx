import React from "react";

const RolesSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse w-full">
      {/* 1. TÍTULO DEL MÓDULO */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="h-4 w-96 bg-gray-100 dark:bg-slate-800 rounded-md"></div>
      </div>

      {/* 2. TABS DE NAVEGACIÓN (Listado | Crear) */}
      <div className="flex gap-4 border-b border-gray-100 dark:border-slate-800 pb-1">
        <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded-t-lg"></div>
        <div className="h-8 w-24 bg-gray-100 dark:bg-slate-800 rounded-t-lg"></div>
      </div>

      {/* 3. CONTENIDO DE ROLES (Repetimos 2 veces para llenar la pantalla) */}
      {[1, 2].map((roleIdx) => (
        <div key={roleIdx} className="space-y-10 pt-4">
          {/* Header del Rol */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
            <div className="space-y-3">
              <div className="h-7 w-40 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="h-3 w-56 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="h-5 w-24 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
              <div className="h-10 w-28 bg-gray-300 dark:bg-slate-600 rounded-xl"></div>
            </div>
          </div>

          {/* Grid de Permisos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="p-5 border border-gray-50 dark:border-slate-800/50 rounded-2xl space-y-5"
              >
                <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-slate-800">
                  <div className="h-2.5 w-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-2.5 w-10 bg-gray-200 dark:bg-slate-700 rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-3/4 bg-gray-100 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-5/6 bg-gray-100 dark:bg-slate-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RolesSkeleton;