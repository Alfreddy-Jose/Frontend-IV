import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  min,
  placeholder = "Seleccione una fecha",
  className,
  ...props
}) {
  const selected = value ? new Date(value) : undefined;
  const minDate = min ? new Date(min) : undefined;

  const handleSelect = (date) => {
    const formatted = date ? date.toISOString().split("T")[0] : "";
    onChange?.({ target: { name, value: formatted } });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-11 rounded-xl bg-gray-200 dark:bg-slate-800/40",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected ? format(selected, "PPP", { locale: es }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            initialFocus
            locale={es}
            fromDate={minDate}
            {...props}
          />
        </PopoverContent>
      </Popover>
      {touched && error ? (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      ) : null}
    </div>
  );
}

export { DateField };
