import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function SkeletonTableFilter() {
    return (
        <div className="animate-in fade-in duration-500 space-y-6">

            {/* 1. Título de la Sección */}
            <div>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>

            {/* 2. Sección de Acciones Superiores al lado derecho (Botón Exportar y Crear nuevo censo) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-end border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex justify-end gap-2">
                    <Skeleton className="h-10 w-36 rounded-xl" /> {/* Lapso seleccionado */}
                    <Skeleton className="h-10 w-36 rounded-xl" /> {/* Botón Exportar */}
                    <Skeleton className="h-10 w-36 rounded-xl" /> {/* Botón Crear nuevo censo */}
                </div>
            </div>

            {/* 3. Skeleton del Carrusel de Métricas Rápidas */}
            <div className="w-full overflow-hidden">
                <div className="flex gap-4 pb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="min-w-[180px] sm:min-w-[200px] flex-1 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40"
                        >
                            <Skeleton className="h-3.5 w-24 mb-2" />
                            <Skeleton className="h-7 w-12 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Estructura de la Tabla y Filtros Locales */}
            <div className="space-y-4">
                {/* 🆕 Barra superior de la tabla (Buscador + Select de Sección) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-t-2xl border border-b-0 border-slate-100 dark:border-slate-800 backdrop-blur-sm">
                    <Skeleton className="h-10 w-full max-w-xs rounded-xl" /> {/* Buscador por nombre/cédula */}

                    {/* 🆕 Select de Sección o Trayecto alineado a la derecha */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Skeleton className="h-10 w-full sm:w-48 rounded-xl" />
                    </div>
                </div>

                {/* Contenedor principal de la Tabla */}
                <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-b-2xl bg-white dark:bg-slate-950">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                            <TableRow className="border-b border-slate-100 dark:border-slate-800">
                                <TableHead className="w-[80px] px-4"><Skeleton className="h-4 w-10" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                                <TableHead className="text-right px-4"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4].map((i) => (
                                <TableRow key={i} className="border-b border-slate-100 dark:border-slate-800">
                                    <TableCell className="py-4 px-4"><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-36" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                    <TableCell className="text-right px-4">
                                        <Skeleton className="h-8 w-8 ml-auto rounded-lg" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* 5. Footer de Paginación */}
                    <div className="flex flex-col gap-4 px-4 py-4 border-t border-slate-100 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between bg-slate-50/20 dark:bg-slate-900/10">
                        <Skeleton className="h-4 w-48" />

                        <div className="flex flex-col items-center gap-4 sm:flex-row lg:gap-8">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-[70px] rounded-lg" />
                            </div>
                            <Skeleton className="h-4 w-20" />
                            <div className="flex items-center gap-1.5">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}