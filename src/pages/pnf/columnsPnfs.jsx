import React from 'react'
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Guard } from '@/components/shared/Guard';

export const columnsPnfs = (onEdit, onDelete) => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "codigo",
    header: "Codigo",
    cell: ({ row }) => {
      const codigo = row.getValue("codigo");
      return <div className="font-medium">{codigo}</div>;
    },
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => {
      const nombre = row.getValue("nombre");
      return <div className="font-medium">{nombre}</div>;
    },
  },
  {
    accessorKey: "abreviado",
    header: "Abreviado",
    cell: ({ row }) => {
      const abreviado = row.getValue("abreviado");
      return <div className="font-medium">{abreviado}</div>;
    },
  },
  {
    accessorKey: "abreviado_coord",
    header: "Abreviado Coordinación",
    cell: ({ row }) => {
      const abreviado_coord = row.getValue("abreviado_coord");
      return <div className="font-medium">{abreviado_coord}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const pnf = row.original;

      return (
        <Guard requiredPermissions={["pnf.editar", "pnf.eliminar"]}>
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
              <Guard requiredPermissions="pnf.editar">
                <DropdownMenuItem
                  onClick={() => onEdit(pnf)}
                  className="cursor-pointer"
                >
                  Editar
                </DropdownMenuItem>
              </Guard>
              <Guard requiredPermissions="pnf.eliminar">
                <DropdownMenuItem
                  onSelect={() => onDelete(pnf)}
                  className="bg-red-50 text-red-700 focus:text-destructive focus:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:focus:bg-red-950 cursor-pointer"
                >
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
