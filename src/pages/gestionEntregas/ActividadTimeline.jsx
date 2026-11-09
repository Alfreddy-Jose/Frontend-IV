import React from "react";
import { Check, Clock, MessageSquare, Edit3, Paperclip } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ActividadTimeline({ actividades }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Actividad Reciente</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Línea de tiempo de acciones académicas realizadas.
        </p>
      </div>

      {/* Timeline Cards Container */}
      <div className="relative border-l border-border pl-4 ml-2 space-y-4 py-2">
        {actividades.map((act) => {
          const isCheck = act.accion === "Marcó";
          const isUncheck = act.accion === "Desmarcó";
          const isAddObs = act.accion === "Agregó observación a";
          const isUpdateObs = act.accion === "Actualizó la observación de";
          const isFile = act.accion === "Adjuntó un archivo a";
          
          return (
          <div key={act.id} className="relative group">
            {/* Circle icon on the line */}
            <div className={`absolute -left-[25px] top-1.5 size-5 rounded-full border-2 bg-background flex items-center justify-center z-10 transition-colors ${isCheck ? "border-emerald-500 text-emerald-500" : isUncheck ? "border-rose-500 text-rose-500" : isAddObs ? "border-blue-500 text-blue-500" : isUpdateObs ? "border-amber-500 text-amber-500" : isFile ? "border-violet-500 text-violet-500" : "border-primary text-primary"}`}>
              {isCheck ? (
                <Check className="size-2.5 stroke-[3px]" />
              ) : isUncheck ? (
                <span className="text-[8px] font-bold">X</span>
              ) : isAddObs ? (
                <MessageSquare className="size-2.5" />
              ) : isUpdateObs ? (
                <Edit3 className="size-2.5" />
              ) : isFile ? (
                <Paperclip className="size-2.5" />
              ) : (
                <Clock className="size-2.5" />
              )}
            </div>

            <Card className="hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 py-3.5 px-4">
              <CardContent className="p-0 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{act.usuario}</span>
                  <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-2.5" />
                    {act.hace_cuanto}
                  </span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  {act.accion} {act.documento} para el docente <b className="text-slate-800 dark:text-slate-200">{act.docente}</b>.
                </p>
              </CardContent>
            </Card>
          </div>
        )})}

        {actividades.length === 0 && (
          <div className="text-center py-6 text-xs text-muted-foreground">
            No se registran actividades recientes en esta sesión.
          </div>
        )}
      </div>
    </div>
  );
}
