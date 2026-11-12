import { Skeleton } from "@/components/ui/skeleton";

/**
 * Estado de carga del módulo de documentos.
 */
export function DocumentoSkeleton() {
    return (
        <div className="animate-in fade-in duration-500">
            {/* 1. Título */}
            <h1 className="mb-4 font-sans text-3xl font-semibold text-slate-900 dark:text-slate-100">
                <Skeleton className="h-9 w-56" />
            </h1>

            {/* 2. Breadcrumb, selector y botón */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-4 w-32" />
                </div>

                <div className="flex items-center gap-4">
                    <Skeleton className="h-11 w-56 rounded-xl" />
                    <Skeleton className="h-11 w-40 rounded-md" />
                </div>
            </div>

            {/* 3. Cuadrícula de documentos */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                    {Array.from({ length: 20 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-transparent p-3"
                        >
                            <Skeleton className="h-10 w-10 rounded-md" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
