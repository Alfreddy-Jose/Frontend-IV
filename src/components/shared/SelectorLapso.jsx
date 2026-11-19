import { Lock } from "lucide-react";
import { useLapso } from "@/context/LapsoContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Selector de lapso académico del navbar.
 * Agrupa los lapsos vigentes y el histórico (cerrados) y comparte la selección
 * con el resto de la aplicación a través de LapsoContext.
 */
export default function SelectorLapso() {
  const { lapsos, selectedLapso, setSelectedLapso, loading } = useLapso();

  const esCerrado = (lapso) => (lapso?.estado ?? lapso?.estatus) === "cerrado";

  // Solo se exponen lapsos activos (vigentes) y cerrados (histórico). Los que
  // están en planificación o cronograma son futuros y no se listan.
  const lapsosActivos = (lapsos || []).filter(
    (lapso) => (lapso?.estado ?? lapso?.estatus) === "activo",
  );
  const lapsosCerrados = (lapsos || []).filter((lapso) => esCerrado(lapso));

  const handleChange = (value) => {
    const lapso = (lapsos || []).find((l) => String(l.id) === String(value));
    if (lapso) setSelectedLapso(lapso);
  };

  return (
    <div className="w-48">
      <Select
        value={selectedLapso ? String(selectedLapso.id) : undefined}
        onValueChange={handleChange}
        disabled={loading || lapsos.length === 0}
      >
        <SelectTrigger className="w-full h-9">
          <SelectValue placeholder="Seleccione lapso..." />
        </SelectTrigger>
        <SelectContent>
          {lapsosActivos.length > 0 && (
            <SelectGroup>
              <SelectLabel>Lapsos activos</SelectLabel>
              {lapsosActivos.map((lapso) => (
                <SelectItem key={lapso.id} value={String(lapso.id)}>
                  {lapso.nombre_lapso}
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {lapsosCerrados.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <Lock className="h-3 w-3" />
                Histórico (cerrados)
              </SelectLabel>
              {lapsosCerrados.map((lapso) => (
                <SelectItem key={lapso.id} value={String(lapso.id)}>
                  {lapso.nombre_lapso}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
