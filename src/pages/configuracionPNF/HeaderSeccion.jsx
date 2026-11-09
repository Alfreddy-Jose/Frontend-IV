import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";

export default function HeaderSeccion({ isDirty, isSubmitting, items }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800/60 pb-6 mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="font-sans capitalize text-3xl mb-4 font-bold text-slate-900 dark:text-white tracking-tight">
            Configuración del PNF
          </h1>
          <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
          </div>
        </div>
        <BreadcrumbReusable items={items} />
      </div>

      <div className="flex items-center gap-2">
        {isSubmitting ? (
          <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1.5 animate-pulse text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
            Guardando cambios...
          </Badge>
        ) : isDirty ? (
          <Badge variant="destructive" className="px-3 py-1 flex items-center gap-1.5 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            Cambios sin guardar
          </Badge>
        ) : (
          <Badge variant="success" className="px-3 py-1 flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Sincronizado con BD
          </Badge>
        )}
      </div>
    </div>
  );
}
