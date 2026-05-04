import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const SkeletonInventario = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 animate-pulse">
      {/* Skeleton del Header */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-48" /> {/* Título Inventario */}
        <Skeleton className="h-4 w-64" /> {/* Breadcrumbs */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lado Izquierdo: Formulario (3/4) */}
        <div className="lg:col-span-3">
          <Card className="p-6 shadow-lg border-gray-100 space-y-8">
            {/* Selector de Tipo de Movimiento */}
            <div className="space-y-4">
              <Skeleton className="h-3 w-32" /> {/* Label */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>

            {/* Grid del Formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
              <div className="md:col-span-2 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" /> {/* ModernInput */}
              </div>
              
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-24 w-full rounded-xl" /> {/* Textarea */}
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6">
              <Skeleton className="h-10 w-28 rounded-lg" />
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
          </Card>
        </div>

        {/* Lado Derecho: Historial (1/4) */}
        <div className="lg:col-span-1">
          <Card className="p-6 shadow-md border-gray-100 space-y-6">
            <Skeleton className="h-6 w-full" /> {/* Título Historial */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};