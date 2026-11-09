import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Users, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function TablaFactibilidadDocente({ materias, seccionesProyectadas }) {
  if (!materias || materias.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay datos de factibilidad docente para este trayecto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        Factibilidad Docente por Unidad Curricular
      </h3>
      <Accordion type="single" collapsible className="w-full space-y-3">
        {materias.map((materia) => {
          const horasRequeridas = seccionesProyectadas * materia.horas_teoricas_base_materia;
          const balance = materia.horas_disponibles_totales - horasRequeridas;
          const isFactible = balance >= 0;

          return (
            <AccordionItem 
              key={materia.unidad_curricular_id} 
              value={`materia-${materia.unidad_curricular_id}`}
              className="border border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-[#0f172a] shadow-sm px-4 overflow-hidden transition-all data-[state=open]:border-indigo-300 dark:data-[state=open]:border-indigo-500/50"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4 pr-4">
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-base">
                      {materia.nombre_materia}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Base: {materia.horas_teoricas_base_materia} hrs/sección
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Requeridas / Disp.</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {horasRequeridas} / {materia.horas_disponibles_totales} hrs
                      </span>
                    </div>
                    {isFactible ? (
                      <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-3 py-1 gap-1 min-w-[120px] justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Suficiente (+{balance})
                      </Badge>
                    ) : (
                      <Badge className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 px-3 py-1 gap-1 min-w-[120px] justify-center">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Déficit ({balance})
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-lg p-4 border border-slate-100 dark:border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Docentes que imparten esta unidad curricular
                  </h4>
                  {materia.docentes_disponibles && materia.docentes_disponibles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {materia.docentes_disponibles.map((docente) => (
                        <div key={docente.id} className="flex flex-col p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{docente.nombre_completo}</span>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                            <span className="text-[10px] uppercase font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                              {docente.dedicacion}
                            </span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {docente.horas_contractuales} hrs contrato
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      No hay docentes disponibles con dedicación para esta materia.
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
