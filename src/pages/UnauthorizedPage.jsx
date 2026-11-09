import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  // Microinteracción para mover los fondos difuminados con el mouse
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
    <div className="min-h-screen w-full bg-[#f8f9ff] dark:bg-[#0b1c30] flex items-center justify-center relative overflow-hidden px-6 py-12 font-['Plus_Jakarta_Sans',_sans-serif] transition-colors duration-300">
      
      {/* Carga de la fuente de iconos de Material */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* Elementos de fondo abstractos interactivos (Modo Claro vs Modo Oscuro) */}
      <div className="blur-blob absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-red-500/10 dark:bg-red-500/10 rounded-full blur-[120px] transition-transform duration-75 ease-out pointer-events-none"></div>
      <div className="blur-blob absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-[#3525cd]/10 dark:bg-[#3525cd]/20 rounded-full blur-[120px] transition-transform duration-75 ease-out pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl text-center px-4">
        <div className="flex flex-col items-center">
          
          {/* Contenedor del Código 403 con Animación Flotante */}
          <div className="relative group select-none">
            {/* Sombra / Clon difuminado de fondo */}
            <h1 className="text-[130px] md:text-[160px] font-black leading-none tracking-tighter opacity-15 dark:opacity-20 blur-[2px] absolute top-2 left-2 bg-gradient-to-br from-red-500 to-[#8b4bfc] bg-clip-text text-transparent">
              403
            </h1>
            {/* Texto principal en gradiente */}
            <h1 className="text-[130px] md:text-[160px] font-black leading-none tracking-tighter bg-gradient-to-br from-red-500 to-[#8b4bfc] bg-clip-text text-transparent relative">
              403
            </h1>

            {/* Animación del Escudo de Alerta */}
            <div className="absolute -top-2 -right-6 md:-right-10 animate-bounce">
              <div className="bg-white/80 dark:bg-[#213145]/90 backdrop-blur-md p-3 md:p-4 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 rotate-12 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 dark:text-red-400 text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  gpp_bad
                </span>
              </div>
            </div>
          </div>

          {/* Textos Informativos */}
          <div className="mt-6 space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-[#0b1c30] dark:text-white tracking-tight">
              Acceso Restringido
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
              No tienes los permisos necesarios para acceder a este módulo. Si crees que se trata de un error, contacta al administrador del sistema.
            </p>
          </div>

          {/* Botón de Retorno con el Color Morado */}
          <div className="mt-8">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-[#8b4bfc] hover:bg-[#712ae2] text-white rounded-full font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#712ae2]/20 dark:shadow-[#712ae2]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mx-auto"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Volver al Dashboard
            </button>
            <p className="mt-4 font-mono text-[10px] text-gray-400 dark:text-slate-500 tracking-widest">
              CÓDIGO DE ERROR: 0x403_PNFI_FORBIDDEN
            </p>
          </div>

        </div>
      </div>

      {/* Círculo decorativo giratorio lento en la esquina inferior */}
      <div className="absolute bottom-10 right-10 opacity-5 dark:opacity-5 pointer-events-none hidden xl:block">
        <div 
          className="w-64 h-64 border-[24px] border-[#3525cd] rounded-full border-t-transparent animate-spin" 
          style={{ animationDuration: "20s" }}
        />
      </div>

    </div>
  );
}