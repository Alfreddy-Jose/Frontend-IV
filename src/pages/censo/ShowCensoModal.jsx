import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, User, Calendar, CheckCircle, Info } from "lucide-react";

export default function ShowCensoModal({ isOpen, onClose, censo, listaPnfs = [], listaSecciones = [] }) {
  if (!censo) return null;

  const { estudiante, tipo_censo, nombre, observaciones, detalles } = censo;
  const persona = estudiante?.persona;

  // MÉTODOS DE BÚSQUEDA: Localizan el objeto PNF correspondiente a los IDs guardados en detalles
  const pnfOrigen = listaPnfs.find(p => String(p.id) === String(detalles?.pnf_origen_id));
  const pnfDestino = listaPnfs.find(p => String(p.id) === String(detalles?.pnf_destino_id));

  // MÉTODOS DE BÚSQUEDAS LOCALIZAN EL OBJETO SECCION CORRESPONDIENTE A LOS IDs GUARDADOS EN DETALLES
  const seccionOrigen = listaSecciones.find(s => String(s.id) === String(detalles?.seccion_origen_id));
  const seccionDestino = listaSecciones.find(s => String(s.id) === String(detalles?.seccion_destino_id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto font-sans">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 border-b pb-3 text-slate-800 dark:text-slate-100">
            <FileText className="h-5 w-5 text-blue-500" />
            Resumen de Ficha de Censo
          </DialogTitle>
          <DialogDescription className="text-xs pt-1">
            {nombre}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Bloque 1: Datos del Estudiante */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Datos del Alumno
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
              <p><span className="font-medium text-slate-500 uppercase">Nombre:</span> {persona?.nombre} {persona?.apellido}</p>
              <p><span className="font-medium text-slate-500">Cédula:</span> {persona?.cedula_persona}</p>
            </div>
          </div>

          {/* Bloque 2: Atributos Dinámicos del JSONB (La magia ocurre aquí) */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" /> 
              Variables Registradas ({tipo_censo})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tipo_censo === "POLITICAS ESTUDIANTILES" && detalles ? (
                <>
                  <div className="p-3 border rounded-lg bg-white dark:bg-slate-950">
                    <span className="text-xs text-slate-400 block">Categoría de Política</span>
                    <span className="font-semibold text-sm uppercase text-slate-800 dark:text-slate-200">
                      {detalles.categoria?.toLowerCase() || "General"}
                    </span>
                  </div>

                  {detalles.disciplina && (
                    <div className="p-3 border rounded-lg bg-white dark:bg-slate-950">
                      <span className="text-xs text-slate-400 block uppercase">Disciplina Deportiva</span>
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 uppercase">{detalles.disciplina}</span>
                    </div>
                  )}

                  {detalles.instrumento && (
                    <div className="p-3 border rounded-lg bg-white dark:bg-slate-950">
                      <span className="text-xs text-slate-400 block">Instrumento Musical</span>
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 uppercase">{detalles.instrumento}</span>
                    </div>
                  )}

                  {detalles.semanas_gestacion && (
                    <div className="p-3 border rounded-lg bg-white dark:bg-slate-950">
                      <span className="text-xs text-slate-400 block">Semanas de Gestación</span>
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 uppercase">{detalles.semanas_gestacion} Semanas</span>
                    </div>
                  )}

                  {detalles.tipo_condicion && (
                    <div className="p-3 border rounded-lg bg-white dark:bg-slate-950 col-span-2">
                      <span className="text-xs text-slate-400 block">Condición Prioritaria / Discapacidad</span>
                      <span className="font-semibold text-sm text-red-600 dark:text-red-400 uppercase">{detalles.tipo_condicion}</span>
                      {detalles.grado_condicion && (
                        <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Diagnóstico:</span> {detalles.grado_condicion}</p>
                      )}
                    </div>
                  )}
                </>
              ) : tipo_censo === "ACADEMICO" && detalles ? (
                <>
                  <div className="p-3 border rounded-lg bg-white dark:bg-slate-950 col-span-2">
                    <span className="text-xs text-slate-400 block">Trámite Solicitado</span>
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 uppercase">{detalles.subtipo_academico}</span>
                  </div>

                  {(detalles?.subtipo_academico === "CAMBIO DE PNF" || detalles?.subtipo_tramite === "CAMBIO DE PNF") && (
                    <>
                      <div className="p-3 border rounded-lg bg-white dark:bg-slate-950">
                        <span className="text-xs text-slate-400 block">PNF de Origen</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 uppercase text-xs">
                          {pnfOrigen ? pnfOrigen.nombre : "No especificado (N/A)"}
                        </span>
                      </div>
                      <div className="p-3 border rounded-lg bg-white dark:bg-slate-950">
                        <span className="text-xs text-slate-400 block">PNF de Destino Solicitado</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-xs">
                          {pnfDestino ? pnfDestino.nombre : "No especificado (N/A)"}
                        </span>
                      </div>
                    </>
                  )}

                  {/* FLUJO DE CAMBIO DE SECCIÓN */}
                  {(detalles?.subtipo_academico === "CAMBIO DE SECCION" || detalles?.subtipo_tramite === "CAMBIO DE SECCION") && (
                    <>
                      <div>
                        <span className="text-xs text-slate-400 block">Sección de Origen</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 uppercase text-xs">
                          {seccionOrigen ? seccionOrigen.nombre : "No especificada (N/A)"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Sección de Destino Solicitada</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-xs">
                          {seccionDestino ? seccionDestino.nombre : "No especificada (N/A)"}
                        </span>
                      </div>
                    </>
                  )}

                  {detalles.asignaturas_pendientes && detalles.asignaturas_pendientes.length > 0 && (
                    <div className="p-3 border rounded-lg bg-white dark:bg-slate-950 col-span-2">
                      <span className="text-xs text-slate-400 block mb-1">Materias Pendientes / Plan Multimodal</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {detalles.asignaturas_detalladas.map((materia, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs px-2 py-1 rounded font-medium border border-blue-100 dark:border-blue-900/50">
                            {materia.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-400 p-3 col-span-2">No se cargaron detalles extras en esta ficha.</p>
              )}
            </div>
          </div>

          {/* Bloque 3: Observaciones Generales */}
          {observaciones && (
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 rounded-xl border border-amber-100/70 dark:border-amber-900/30">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1 mb-1">
                <Info className="h-3.5 w-3.5" /> Observaciones del Operador
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                "{observaciones}"
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}