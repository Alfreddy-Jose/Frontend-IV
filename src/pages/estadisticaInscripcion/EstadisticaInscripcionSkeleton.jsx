import { Skeleton } from "@/components/ui/skeleton"

export function EstadisticaInscripcionSkeleton() {
    return (
        <div className="animate-in fade-in duration-500">
            {/* 1. Título */}
            <h1 className="mb-4 font-sans text-3xl font-semibold text-slate-900 dark:text-slate-100">
                <Skeleton className="h-9 w-72" />
            </h1>

            {/* 2. Sección Breadcrumb y Botón y Select */}
            <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-4 w-44" />
                </div>

                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-48 rounded-md" />
                    <Skeleton className="h-10 w-44 rounded-md" />
                </div>
            </div>

            {/* 3. Panel de Tabla Analisis Secciones */}
            <div className="mt-8 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                {/* Encabezado y Filtros */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <Skeleton className="h-5 w-40 mb-1.5" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-7 w-14 rounded-md" />
                        <Skeleton className="h-7 w-20 rounded-md" />
                        <Skeleton className="h-7 w-28 rounded-md" />
                        <Skeleton className="h-7 w-28 rounded-md" />
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <div className="w-full min-w-[800px]">
                        {/* Cabecera Tabla */}
                        <div className="flex bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800 px-4 py-3">
                            <Skeleton className="h-4 w-20 mx-4" />
                            <Skeleton className="h-4 w-24 mx-4" />
                            <Skeleton className="h-4 w-20 mx-4" />
                            <Skeleton className="h-4 w-20 mx-4" />
                            <Skeleton className="h-4 w-20 mx-4" />
                            <Skeleton className="h-4 w-32 ml-auto mx-4" />
                        </div>
                        {/* Filas */}
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center border-b border-gray-100 dark:border-slate-800 px-4 py-4">
                                <Skeleton className="h-4 w-32 mx-4" />
                                <Skeleton className="h-4 w-32 mx-4" />
                                <Skeleton className="h-4 w-24 mx-4" />
                                <Skeleton className="h-4 w-12 mx-4" />
                                <Skeleton className="h-6 w-24 rounded-full mx-4" />
                                <Skeleton className="h-8 w-28 rounded-md ml-auto mx-4" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 dark:border-slate-800">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    )
}
