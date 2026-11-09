import React from 'react'
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Guard } from '@/components/shared/Guard';

export const columnsTrayecto = (onDelete) => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => {
      const nombre = row.getValue("nombre");
      return <div className="font-medium">{nombre}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const trayecto = row.original;

      return (
        <Guard requiredPermissions="trayecto.eliminar">
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
              <Guard requiredPermissions="trayecto.eliminar">
                <DropdownMenuItem
                  onSelect={() => onDelete(trayecto)}
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
