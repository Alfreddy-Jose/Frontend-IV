/* import React from 'react'
import { Skeleton } from '../ui/skeleton';

function SkeletonTable() {
  return (
    <div className="flex w-full flex-col gap-2">
      {Array.from({ length: 10 }).map((_, index) => (
        <div className="flex gap-4" key={index}>
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

export default SkeletonTable; */

import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function SkeletonTable() {
  return (
    <div className="w-full space-y-6 p-6">
      {/* Header: Título, Breadcrumbs y Botón */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" /> {/* "Title" */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-12" /> {/* "Home" */}
            <Skeleton className="h-4 w-4" />  {/* ">" */}
            <Skeleton className="h-4 w-12" /> {/* "Ruta actual" */}
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" /> {/* Botón "+ Nuevo" */}
      </div>

      {/* Card contenedor de la tabla */}
      <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
        {/* Barra de búsqueda interna */}
        <div className="p-4 border-b border-border">
          <Skeleton className="h-10 w-full max-w-sm rounded-md" />
        </div>

        {/* Tabla simulada */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>
              <TableHead><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-4 w-4 ml-auto" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Generamos 5 filas de ejemplo */}
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><div className="flex justify-end"><Skeleton className="h-4 w-4" /></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Footer: Paginación */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <Skeleton className="h-4 w-40" /> {/* "0 de 3 filas seleccionadas" */}
          <div className="flex items-center space-x-6">
            <Skeleton className="h-4 w-24" /> {/* "Filas por página" */}
            <Skeleton className="h-8 w-12 rounded-md" /> {/* Selector 10 */}
            <Skeleton className="h-4 w-20" /> {/* "Páginas 1 de 1" */}
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}