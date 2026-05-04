import React from "react";
import { cn } from "@/lib/utils";

const ModernInput = React.forwardRef(({ className, type, ...props }, ref) => {


  return (
    <div className="group relative w-full">
      <div className={cn(
        "relative flex items-center h-11 w-full rounded-xl overflow-hidden transition-all",
        "bg-gray-200 dark:bg-slate-800/40 focus-within:bg-gray-100 dark:focus-within:bg-slate-800/60 shadow-sm",
        className
      )}>

        <input
          type={type}
          className="peer w-full bg-transparent pl-3 pr-4 py-2 text-sm outline-none border-none placeholder:text-gray-500 dark:placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          ref={ref}
          {...props}
        />
        {/* Línea animada: que se expande */}
        <span 
          className="absolute bottom-0 left-1/2 h-[2.5px] w-0 bg-primary transition-all duration-300 ease-in-out peer-focus:left-0 peer-focus:w-full" 
        />
      </div>
    </div>
  );
});

ModernInput.displayName = "ModernInput";

export { ModernInput };