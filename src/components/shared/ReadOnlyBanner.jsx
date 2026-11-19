import { Lock } from "lucide-react";
import { useLapso } from "@/context/LapsoContext";

/**
 * Banner informativo que aparece cuando el lapso seleccionado está cerrado,
 * indicando que el sistema está en modo consulta (solo lectura).
 */
export default function ReadOnlyBanner() {
  const { isReadOnly, selectedLapso } = useLapso();

  if (!isReadOnly) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border px-4 py-2 text-sm border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
      <Lock className="h-4 w-4 shrink-0" />
      <span>
        Modo consulta — el lapso <b>{selectedLapso?.nombre_lapso}</b> está
        cerrado. Las acciones de creación, edición y eliminación están
        deshabilitadas.
      </span>
    </div>
  );
}
