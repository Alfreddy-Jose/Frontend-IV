import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton que se muestra mientras se cargan los datos base del PNF
 * (trayectos, configuraciones y borrador) al seleccionar lapso + PNF + sede.
 */
export default function ProyeccionDataSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tabs skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-56 rounded-md" />
        <div className="flex gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 flex-1 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Trayecto card skeleton */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] space-y-5">
        {/* Card header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* Result metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      </div>

      {/* Tabla factibilidad skeleton */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <Skeleton className="h-5 w-48 rounded-md" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="grid grid-cols-4 gap-4">
              <Skeleton className="h-4 col-span-2 rounded-md" />
              <Skeleton className="h-4 rounded-md" />
              <Skeleton className="h-4 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
