import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  CheckCircle,
  Sparkles,
  FileText,
  Download,
  ShieldCheck,
} from "lucide-react";
import { notify } from "@/components/shared/Notify";
import { exportarProyeccionExcel, finalizarProyeccion } from "@/services/proyeccionService";

export default function Paso3Revision({ onBack, onFinish, selection = {}, detalles = [] }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinalSubmit = async () => {
    // 1. Validar que exista el ID de la proyección creada en el Paso 1
    if (!selection?.proyeccion_id) {
      notify.error("No se encontró el ID de la proyección. Por favor, regresa al Paso 1.");
      return;
    }

    // 2. Payload mínimo: solo cambio de estado. Los detalles ya fueron guardados en pasos anteriores.
    const payload = {
      proyeccion_id: selection.proyeccion_id,
      estado: "finalizado",
    };

    setIsSubmitting(true);
    try {
      const response = await finalizarProyeccion(payload);

      notify.success(response?.message || "¡Proyección Académica finalizada y registrada con éxito!");
      if (onFinish) {
        onFinish();
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 422) {
          const errors = error.response.data?.errors;
          if (errors) {
            Object.keys(errors).forEach((key) => {
              errors[key].forEach((errMsg) => notify.error(errMsg));
            });
          } else {
            notify.error(error.response.data?.message || "Error de validación.");
          }
        } else if (error.response.status === 500) {
          notify.error("Ocurrió un error inesperado en el servidor (HTTP 500).");
        } else {
          notify.error(error.response.data?.message || "Ocurrió un error al finalizar la proyección.");
        }
      } else {
        notify.error("Error de conexión con el servidor.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDescargarExcel = async () => {
    try {
      setIsExporting(true);

      await notify.promise(
        (async () => {
          const response = await exportarProyeccionExcel(
            detalles,
            selection.ano_proyectado ? Number(selection.ano_proyectado) : null,
            selection.ano_origen_historico ? Number(selection.ano_origen_historico) : null,
            selection.proyeccion_id ? Number(selection.proyeccion_id) : null
          );
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "Proyeccion_Secciones.xlsx");
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(url);
        })(),
        {
          loading: "Generando reporte Excel de Proyección...",
          success: "Reporte Excel descargado con éxito",
          error: "No se pudo procesar el archivo Excel",
        }
      );
    } catch (error) {
      console.error("Error al descargar el reporte Excel:", error);
      notify.error("Ocurrió un error al generar el reporte. Inténtalo nuevamente.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── ALERTA DE GENERACIÓN DE REPORTE ── */}
      {isExporting && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-sm font-medium shadow-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent flex-shrink-0" />
          Generando reporte Excel de Proyección, por favor espere...
        </div>
      )}

      {/* ── ESQUELETO VISUAL PREMIUM DE LA REVISIÓN ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-75 pointer-events-none select-none">
        {/* Card 1: Control de Aprobación */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Control de Aprobación
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Paso 1: Plantilla base de secciones validada y guardada.</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>Paso 2: Simulación y capacidades configuradas.</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>Paso 3: Verificación de factibilidad docente finalizada.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Reportes Disponibles */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  Reportes Disponibles
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-500">
                <Download className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Consolidado_Secciones_Proyectadas.pdf</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── BOTONES DE NAVEGACIÓN ACTIVA ── */}
      <div className="flex justify-between items-center p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="px-5 py-2 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Paso 2
        </Button>

        <div className="flex items-center gap-3">
          {/* Botón Descargar Reporte Excel */}
          <Button
            type="button"
            variant="outline"
            onClick={handleDescargarExcel}
            disabled={isExporting}
            className="flex items-center gap-2 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer rounded-xl text-sm font-semibold"
          >
            {isExporting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            ) : (
              <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className="hidden sm:inline">
              {isExporting ? "Procesando..." : "Descargar Reporte en Excel"}
            </span>
          </Button>

          {/* Botón Finalizar */}
          <Button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 cursor-pointer shadow-sm"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isSubmitting ? "Guardando..." : "Finalizar y Registrar Proyección"}
          </Button>
        </div>
      </div>
    </div>
  );
}
