import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function SkeletonTable() {
  return (
    <div className="animate-in fade-in duration-500">
      {/* 1. Título */}
      <h1 className="mb-4 font-sans text-3xl font-semibold text-slate-900 dark:text-slate-100">
        <Skeleton className="h-9 w-72" />
      </h1>

      {/* 2. Sección Breadcrumb y Botón */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-4 w-32" />
        </div>
        
        <div className="flex justify-end">
          <Skeleton className="h-10 w-44 rounded-md" />
        </div>
      </div>

      {/* 3. Estructura de Filtros Superiores */}
      <div className="space-y-4">
        {/* bg-white/50 para modo claro, dark:bg-slate-900/50 para modo oscuro */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 p-4 rounded-t-xl border border-b-0 border-gray-100 dark:border-slate-800 backdrop-blur-sm">
          <div className="relative w-full max-w-sm">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        {/* 4. Contenedor de la Tabla */}
        <div className="overflow-hidden border border-gray-100 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-slate-900/50">
              <TableRow className="border-b border-gray-100 dark:border-slate-800">
                <TableHead className="w-[50px] px-4"><Skeleton className="h-5 w-5 rounded-md" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-12" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead className="text-right px-4"><Skeleton className="h-4 w-4 ml-auto" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i} className="border-b border-gray-100 dark:border-slate-800">
                  <TableCell className="py-4 px-4"><Skeleton className="h-5 w-5 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right px-4">
                    <Skeleton className="h-5 w-5 ml-auto rounded-sm" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 5. Footer de Paginación */}
          <div className="flex flex-col gap-4 px-4 py-4 border-t border-gray-100 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-5 w-56" />
            
            <div className="flex flex-col items-center gap-4 sm:flex-row lg:gap-8">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-[70px]" />
              </div>
              <Skeleton className="h-5 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}