import React from 'react'
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, SquarePen, Eye } from 'lucide-react';
import { Guard } from '@/components/shared/Guard';

export const columnsDocente = (onEdit, onDelete, onShow) => [
  {
    accessorKey: "persona",
    header: "Cédula",
    cell: ({ row }) => {
      const cedula_persona = row.getValue("persona")?.cedula_persona;
      return <div className="font-medium">{cedula_persona}</div>;
    },
  },
  { 
    id: "nombre", // ID necesario para que coincida con filterColumn="nombre"
    accessorFn: (row) => `${row.persona?.nombre || ""} ${row.persona?.apellido || ""}`,
    header: "Nombre Completo",
    cell: ({ row }) => {
      // Usamos row.original para acceder de forma segura a los datos anidados
      const nombre = row.original.persona?.nombre;
      const apellido = row.original.persona?.apellido;
      return <div className="font-medium uppercase">{nombre} {apellido}</div>;
    },
  },
  {
    accessorKey: "pnf",
    header: "PNF",
    cell: ({ row }) => {
      const pnf = row.getValue("pnf");
      return <div className="uppercase font-medium">{pnf?.nombre}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const docente = row.original;

      return (
        <Guard requiredPermissions={["docente.editar", "docente.eliminar"]}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Opción para Ver Detalles */}
              <DropdownMenuItem
                onClick={() => onShow(docente)}
                className="cursor-pointer"
              >
                <Eye className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                Ver Detalles
              </DropdownMenuItem>

              <Guard requiredPermissions="docente.editar">
                <DropdownMenuItem
                  onClick={() => onEdit(docente)}
                  className="cursor-pointer"
                >
                  <SquarePen className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                  Editar
                </DropdownMenuItem>
              </Guard>
              <Guard requiredPermissions="docente.eliminar">
                <DropdownMenuItem
                  onSelect={() => onDelete(docente)}
                  className="bg-red-50 text-red-700 focus:text-destructive focus:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:focus:bg-red-950 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 text-red-700 dark:text-red-300" />
                  Eliminar
                </DropdownMenuItem>
              </Guard>
            </DropdownMenuContent>
          </DropdownMenu>
        </Guard>
      );
    },
  },
]