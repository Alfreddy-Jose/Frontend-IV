import * as React from "react"
import { CheckIcon } from "lucide-react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox" 

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Mantiene exactamente su tamaño actual (size-5) y bordes redondeados suave
        "peer size-5 shrink-0 rounded-md transition-all duration-200 outline-none",
        
        // Clonado de la estética de InputModerno_3 (Bordes reales y fondo slate)
        "border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60",
        
        // Estado de Enfoque (Focus) adaptado a la paleta Índigo
        "focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:focus-visible:ring-indigo-400/50",
        
        // Estado Marcado (Checked) - Ahora usa el Indigo de tus otros componentes
        "data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-600 dark:data-[state=checked]:border-indigo-500 text-white",
        
        // Deshabilitado
        "disabled:cursor-not-allowed disabled:opacity-50",
        
        // Sombra suave
        "shadow-sm",
        
        className
      )}
      {...props}>
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current">
        <CheckIcon className="size-3.5 stroke-[3px]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox }