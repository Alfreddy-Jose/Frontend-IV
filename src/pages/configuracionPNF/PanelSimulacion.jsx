import React from "react";
import { Users, GraduationCap, School, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function PanelSimulacion({ values, isValid, labelTrayecto }) {
  const { max_estudiantes_seccion, tasa_aprobacion_base, tasa_reprobacion_base } = values;

  // Asegurar valores válidos para cálculos
  const capMax = Number(max_estudiantes_seccion) || 30;
  const tasaAprob = Number(tasa_aprobacion_base) || 0;
  const tasaReprob = Number(tasa_reprobacion_base) || 0;

  // Simulación para 100 alumnos
  const totalAlumnos = 100;
  const alumnosAprobados = Math.round(totalAlumnos * (tasaAprob / 100));
  const alumnosReprobados = Math.round(totalAlumnos * (tasaReprob / 100));

  // Número de secciones requeridas
  const seccionesRequeridas = Math.ceil(totalAlumnos / capMax);

  // Estudiantes promedio por sección
  const alumnosPorSeccion = seccionesRequeridas > 0
    ? parseFloat((totalAlumnos / seccionesRequeridas).toFixed(1))
    : 0;

  // Porcentaje de llenado de cada aula
  const porcentajeLlenado = Math.min(100, Math.round((alumnosPorSeccion / capMax) * 100));

  // Suma de tasas para advertencia
  const sumaTasas = tasaAprob + tasaReprob;
  const esSumaInvalida = sumaTasas !== 100;

  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0f172a]/20 h-full">
      {/* Header del Panel */}
      <div>
        <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
          <School className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Live Preview: Simulación
        </h3>
        {labelTrayecto && (
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
            {labelTrayecto}
          </span>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          Simulación en tiempo real del impacto en una muestra estándar de{" "}
          <strong className="text-slate-700 dark:text-slate-200 font-semibold">100 estudiantes</strong>.
        </p>
      </div>

      {/* Alerta si las tasas no suman 100% */}
      {esSumaInvalida && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
          <div className="space-y-0.5">
            <span className="font-semibold">Inconsistencia en tasas</span>
            <p className="opacity-90">
              Las tasas de aprobación ({tasaAprob}%) y reprobación ({tasaReprob}%)
              deben sumar exactamente 100%. Actualmente suman {sumaTasas}%.
            </p>
          </div>
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* KPI Secciones */}
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a]/40 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-1">
            <span className="text-xs font-medium">Secciones</span>
            <School className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            {seccionesRequeridas}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            para 100 estudiantes
          </span>
        </div>

        {/* KPI Estudiantes por Sección */}
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a]/40 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-1">
            <span className="text-xs font-medium">Promedio/Aula</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            {alumnosPorSeccion}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Límite máx: {capMax}
          </span>
        </div>
      </div>

      {/* Gráfico de Distribución Aprobados/Reprobados */}
      <div className="space-y-2.5 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a]/40 shadow-sm">
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-emerald-500" />
            Aprobación: {alumnosAprobados}
          </span>
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Reprobación: {alumnosReprobados}
          </span>
        </div>

        {/* Stacked custom progress bar */}
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${tasaAprob}%` }}
            className="h-full bg-emerald-500 dark:bg-emerald-600 transition-all duration-300"
            title={`Aprobados: ${alumnosAprobados} alumnos (${tasaAprob}%)`}
          />
          <div
            style={{ width: `${tasaReprob}%` }}
            className="h-full bg-red-500 dark:bg-red-600 transition-all duration-300"
            title={`Reprobados: ${alumnosReprobados} alumnos (${tasaReprob}%)`}
          />
        </div>
      </div>
    </div>
  );
}
