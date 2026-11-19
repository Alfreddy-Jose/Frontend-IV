export default function Footer() {
  return (
    <>
      <footer className="bg-white md:flex md:items-center md:justify-between shadow rounded-lg p-4 md:p-6 my-6 mx-4 dark:bg-slate-900">
        {/* Identidad del sistema */}
        <div className="mb-4 md:mb-0">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Sistema de Gestión Administrativa — PNFI
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Versión 1.0.0 · {new Date().getFullYear()}
          </p>
        </div>

        {/* Enlaces útiles */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Sistema en Línea
          </span>
          <span className="hidden sm:inline">·</span>
          <a
            href="/manual_completo.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Manual de Usuario
          </a>
          {/* <span>·</span>
          <a href="#" className="hover:underline">
            Soporte
          </a> */}
        </div>
      </footer>

      <p className="text-center text-sm text-gray-500 my-10">
        &copy; {new Date().getFullYear()} PNFI · Sistema de Gestión Administrativa.
        Todos los derechos reservados.
      </p>
    </>
  );
}
