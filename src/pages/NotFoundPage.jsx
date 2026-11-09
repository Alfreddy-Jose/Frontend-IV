import { useEffect } from "react";
import { ArrowLeft, HelpCircle, LifeBuoy, History, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  // Microinteracción para mover los fondos difuminados con el movimiento del mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      const blobs = document.querySelectorAll(".blur-blob");
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      blobs.forEach((blob, index) => {
        const factor = (index + 1) * 30;
        blob.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center px-4 bg-[#f8fafc] text-[#0f172a] transition-colors duration-300 dark:bg-[#020617] dark:text-slate-100">
      
      {/* Elementos de fondo abstractos interactivos (Fondo Difuminado Blobs) */}
      <div className="blur-blob absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-[120px] transition-transform duration-75 ease-out pointer-events-none" />
      <div className="blur-blob absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-violet-500/10 dark:bg-violet-500/10 rounded-full blur-[120px] transition-transform duration-75 ease-out pointer-events-none" />

      {/* Elemento decorativo circular flotante con giro lento (esquina inferior derecha) */}
      <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full border-[16px] opacity-10 border-indigo-500 rounded-full border-t-transparent animate-spin pointer-events-none dark:opacity-5 hidden xl:block" style={{ animationDuration: "20s" }} />

      {/* Contenedor Principal */}
      <div className="max-w-3xl w-full text-center z-10 flex flex-col items-center">
        
        {/* Número 404 Gigante con badge flotante animado */}
        <div className="relative inline-block select-none mb-4 group">
          {/* Sombra/Clon difuminado de fondo para dar profundidad */}
          <h1 className="text-[120px] sm:text-[150px] font-black leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-indigo-500 to-violet-600 dark:from-violet-400 dark:to-fuchsia-500 opacity-20 blur-[2px] absolute top-2 left-2">
            404
          </h1>
          {/* Texto principal en gradiente */}
          <h1 className="text-[120px] sm:text-[150px] font-black leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-indigo-500 to-violet-600 dark:from-violet-400 dark:to-fuchsia-500 relative drop-shadow-sm">
            404
          </h1>
          {/* Icono de lupa de búsqueda tachada flotante con animación constante */}
          <div className="absolute -top-2 -right-4 bg-white p-2 rounded-xl shadow-md border border-slate-100 rotate-12 text-indigo-600 dark:bg-slate-900 dark:border-slate-800 dark:text-violet-400 animate-bounce">
            <Search className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Mensaje de Error */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-white">
          ¡Vaya! Página no encontrada
        </h2>
        <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto mb-10 leading-relaxed dark:text-slate-400">
          Lo sentimos, el recurso que estás buscando no existe o ha sido movido. Verifica la URL o intenta volver al inicio.
        </p>

        {/* Grid de 3 Columnas / Accesos Directos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10拾">
          
          {/* Tarjeta 1: Centro de Ayuda */}
          <div className="flex flex-col items-start text-left p-5 bg-white border border-slate-100 rounded-xl shadow-sm transition-all hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-500/40 hover:bg-white/80 dark:hover:bg-slate-900/80 group cursor-pointer dark:bg-slate-900/40 dark:border-slate-800/60">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mb-4 dark:bg-indigo-950/50 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold mb-1 text-slate-800 dark:text-slate-200">
              Centro de Ayuda
            </h3>
            <p className="text-xs text-slate-400 leading-normal dark:text-slate-500">
              Consulta guías y tutoriales del sistema.
            </p>
          </div>

          {/* Tarjeta 2: Soporte Técnico */}
          <div className="flex flex-col items-start text-left p-5 bg-white border border-slate-100 rounded-xl shadow-sm transition-all hover:shadow-md hover:border-violet-500/30 dark:hover:border-violet-500/40 hover:bg-white/80 dark:hover:bg-slate-900/80 group cursor-pointer dark:bg-slate-900/40 dark:border-slate-800/60">
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600 mb-4 dark:bg-violet-950/50 dark:text-violet-400 group-hover:scale-110 transition-transform">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold mb-1 text-slate-800 dark:text-slate-200">
              Soporte Técnico
            </h3>
            <p className="text-xs text-slate-400 leading-normal dark:text-slate-500">
              Reporta una falla en la plataforma.
            </p>
          </div>

          {/* Tarjeta 3: Historial */}
          <div className="flex flex-col items-start text-left p-5 bg-white border border-slate-100 rounded-xl shadow-sm transition-all hover:shadow-md hover:border-purple-500/30 dark:hover:border-purple-500/40 hover:bg-white/80 dark:hover:bg-slate-900/80 group cursor-pointer dark:bg-slate-900/40 dark:border-slate-800/60">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 mb-4 dark:bg-purple-950/50 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold mb-1 text-slate-800 dark:text-slate-200">
              Historial
            </h3>
            <p className="text-xs text-slate-400 leading-normal dark:text-slate-500">
              Vuelve a tus actividades recientes.
            </p>
          </div>

        </div>

        {/* Botón de Retorno con Escala Reactiva */}
        <Button
          onClick={() => navigate("/")}
          className="mt-8 px-6 py-3 bg-[#8b4bfc] hover:bg-[#712ae2] text-white rounded-full font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#712ae2]/20 dark:shadow-[#712ae2]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mx-auto"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          Volver al Dashboard
        </Button>

        {/* Código Técnico Inferior */}
        <span className="mt-8 text-[11px] font-mono tracking-wider uppercase text-slate-400/80 dark:text-slate-600">
          Código de error: 0x404_PNFI_SYSTEM
        </span>

      </div>
    </div>
  );
}