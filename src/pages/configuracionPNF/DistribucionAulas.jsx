import React from "react";
import { Progress } from "@/components/ui/progress";

export default function DistribucionAulas({ values }) {
  const capMax = Number(values.max_estudiantes_seccion) || 30;
  const totalAlumnos = 100;

  // Número de secciones requeridas
  const seccionesRequeridas = Math.ceil(totalAlumnos / capMax);

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wider uppercase">
        Distribución de Aulas Estimada
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: seccionesRequeridas }).map((_, idx) => {
          // Calcular cuántos alumnos van a esta aula en particular
          let alumnosEnAula = capMax;
          if (idx === seccionesRequeridas - 1) {
            alumnosEnAula = totalAlumnos - capMax * (seccionesRequeridas - 1);
          }
          const pctLleno = Math.min(100, Math.round((alumnosEnAula / capMax) * 100));

          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d16] space-y-3 hover:border-indigo-400/40 dark:hover:border-indigo-500/30 transition-all shadow-sm"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Sección {idx + 1}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {alumnosEnAula} / {capMax} Est. ({pctLleno}%)
                </span>
              </div>

              <div className="space-y-2">
                <Progress value={pctLleno} className="h-1.5" />
                <div className="flex flex-wrap gap-1 pt-1 opacity-70">
                  {/* Render mini visual dots indicating students inside classroom */}
                  {Array.from({ length: Math.min(15, Math.ceil(alumnosEnAula / 2.5)) }).map((_, dotIdx) => (
                    <div
                      key={dotIdx}
                      className="w-1.5 h-1.5 rounded-full bg-indigo-500/80 dark:bg-indigo-400/80"
                    />
                  ))}
                  {alumnosEnAula > 37 && (
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 self-center">
                      +
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
