import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

/**
 * Componente modal genérico para visualizar detalles de cualquier registro.
 *
 * @param {boolean} isOpen - Estado de apertura del modal
 * @param {function} onClose - Función para cerrar el modal
 * @param {string} title - Título del registro (ej. "Detalles del Docente")
 * @param {string} description - Subtítulo o código identificador
 * @param {React.ReactNode} icon - Ícono de Lucide a mostrar
 * @param {Object} data - Objeto con los datos del registro a mostrar
 * @param {Array} sections - Configuración de secciones y campos
 */
export default function GenericShowModal({
  isOpen,
  onClose,
  title = "Detalles del Registro",
  description,
  icon: Icon = Info,
  data,
  sections = [],
}) {
  if (!data) return null;

  // Helper para obtener valores anidados como "municipio.nombre" o "persona.cedula"
  const getNestedValue = (obj, path) => {
    if (!path) return null;
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto font-sans">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 border-b pb-3 text-slate-800 dark:text-slate-100">
            <Icon className="h-5 w-5 text-blue-500" />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs pt-1 uppercase">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-5 py-2">
          {sections.map((section, sIdx) => {
            const SectionIcon = section.icon;

            return (
              <div
                key={sIdx}
                className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3"
              >
                {section.title && (
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    {SectionIcon && <SectionIcon className="h-3.5 w-3.5" />}
                    {section.title}
                  </h4>
                )}

                <div className={`grid grid-cols-1 md:grid-cols-${section.columns || 2} gap-3`}>
                  {section.fields.map((field, fIdx) => {
                    // Si el campo tiene condición personalizada para ocultarse
                    if (field.hide && field.hide(data)) return null;

                    // Extracción del valor simple o anidado
                    let rawValue = field.accessor
                      ? getNestedValue(data, field.accessor)
                      : data[field.key];

                    // Formateador personalizado si existe
                    let displayValue = field.render
                      ? field.render(rawValue, data)
                      : rawValue ?? "N/A";

                    return (
                      <div
                        key={fIdx}
                        className={field.fullWidth ? "col-span-full" : "col-span-1"}
                      >
                        <span className="text-xs text-slate-400 block font-medium uppercase">
                          {field.label}
                        </span>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                          {displayValue}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}