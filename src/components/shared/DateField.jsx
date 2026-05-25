import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function DateField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  touched,
  min, // Recibe la fecha de inicio
  placeholder = "Seleccione una fecha",
  className,
  ...props
}) {
  const selected = value ? parseISO(value) : undefined;
  const minDate = min ? parseISO(min) : undefined;

  const handleSelect = (date) => {
    if (!date) return;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formatted = `${year}-${month}-${day}`;

    onChange?.({ target: { name, value: formatted } });
  };

  // Definimos un rango de años razonable para la selección
  const currentYear = new Date().getFullYear();

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={id} className="text-xs md:text-sm">{label}</Label> : null}
      <Popover>
        <PopoverTrigger asChild>
          {/* Contenedor principal: Clonado idéntico al div de InputModerno 
            Se usa h-auto e inline-flex/items-center para que dependa exclusivamente del padding del input interno.
          */}
          <Button
            variant="outline"
            className={cn(
              "peer w-full h-auto justify-start text-left font-normal rounded-xl transition-all shadow-sm border overflow-hidden p-0",
              "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60",
              "hover:bg-white dark:hover:bg-slate-950/40 focus:bg-white dark:focus:bg-slate-950/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              touched && error && "border-red-500 dark:border-red-500"
            )}
          >
            {/* Contenedor Interno: Replica exactamente las mismas proporciones, paddings y comportamiento del <input> de InputModerno 
            */}
            <div className="flex items-center w-full pl-4 pr-4 py-1.5 md:py-2 text-xs md:text-sm text-slate-900 dark:text-slate-100">
              <CalendarIcon className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className={cn("truncate", !value && "text-slate-400 dark:text-slate-500")}>
                {selected ? format(selected, "PPP", { locale: es }) : placeholder}
              </span>
            </div>

            {/* Línea animada: idéntica a InputModerno (se activa mediante el foco del Popover/Button) */}
            <span className="absolute bottom-0 left-1/2 h-[2.5px] w-0 bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-in-out group-hover:w-0 peer-data-[state=open]:left-0 peer-data-[state=open]:w-full focus:left-0 focus:w-full" />
          </Button>
        </PopoverTrigger>
        <PopoverPrimitive.Portal>
          <PopoverContent
            align="start"
            side="bottom"
            sideOffset={4}
            className="z-[999] w-auto p-0 pointer-events-auto"
          >
            <Calendar
              mode="single"
              selected={selected} 
              onSelect={handleSelect}
              defaultMonth={selected}
              initialFocus
              locale={es}
              captionLayout="dropdown" 
              fromYear={currentYear - 10} 
              toYear={currentYear + 20}   
              disabled={(date) => (minDate ? date < minDate : false)}
              {...props}
            />
          </PopoverContent>
        </PopoverPrimitive.Portal>
      </Popover>
      {touched && error ? (
        <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
      ) : null}
    </div>
  );
}

export { DateField };