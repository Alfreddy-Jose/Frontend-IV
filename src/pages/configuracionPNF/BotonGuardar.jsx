import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

export default function BotonGuardar({ isSubmitting }) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="w-full md:w-auto min-w-[165px] flex items-center justify-center gap-2 font-semibold shadow-md active:scale-95 transition-all duration-200"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
          <span>Guardando...</span>
        </>
      ) : (
        <>
          <Save className="w-4.5 h-4.5 text-white" />
          <span>Guardar Configuración</span>
        </>
      )}
    </Button>
  );
}
