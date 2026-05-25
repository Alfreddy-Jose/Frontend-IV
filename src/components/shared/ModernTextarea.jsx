import React from "react";
import { cn } from "@/lib/utils";

const ModernTextarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div className="group relative w-full">
      <div className={cn(
        "relative flex w-full rounded-xl overflow-hidden transition-all border border-slate-200 dark:border-slate-800",
        // Clonado idéntico de InputModerno_3
        "bg-slate-100 dark:bg-slate-900/60 focus-within:bg-white dark:focus-within:bg-slate-950/40 shadow-sm",
        className
      )}>
        <textarea
          className={cn(
            // Tipografía y paddings adaptados milimétricamente al estilo compacto
            "peer min-h-[80px] w-full bg-transparent pl-4 pr-4 py-1.5 md:py-2 text-xs md:text-sm outline-none border-none",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          )}
          ref={ref}
          {...props}
        />
        
        {/* Línea animada idéntica al input moderno */}
        <span 
          className="absolute bottom-0 left-1/2 h-[2.5px] w-0 bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-in-out peer-focus:left-0 peer-focus:w-full" 
        />
      </div>
    </div>
  );
});

ModernTextarea.displayName = "ModernTextarea";

export { ModernTextarea };