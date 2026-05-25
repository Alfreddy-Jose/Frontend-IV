import React from 'react'

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from '@/components/ui/badge';
import { Guard } from '@/components/shared/Guard';

export const columnsLapso = (onEdit, onDelete) => [
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
    accessorKey: "nombre_lapso",
    header: "Nombre",
    cell: ({ row }) => {
      const nombre_lapso = row.getValue("nombre_lapso");
      return <div className="font-medium">{nombre_lapso}</div>;
    },
  },
  {
    accessorKey: "ano",
    header: "Año",
    cell: ({ row }) => {
      const ano = row.getValue("ano");
      return <div className="font-medium">{ano}</div>;
    },
  },
  {
    accessorKey: "fecha_inicio",
    header: "Fecha Inicio",
    cell: ({ row }) => {
      const fecha_inicio = row.getValue("fecha_inicio");
      return <div className="font-medium">{fecha_inicio}</div>;
    },
  },
  {
    accessorKey: "fecha_fin",
    header: "Fecha Fin",
    cell: ({ row }) => {
      const fecha_fin = row.getValue("fecha_fin");
      return <div className="font-medium">{fecha_fin}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      // mostrar estado con el componente Badge de shandc/ui
      return <Badge variant={status ? "success" : "destructive"} className="capitalize">{status ? "Activo" : "Inactivo"}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const lapso = row.original;

      return (
        <Guard requiredPermissions={["lapso.editar", "lapso.eliminar"]}>
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
              <Guard requiredPermissions="lapso.editar">
                <DropdownMenuItem
                  onClick={() => onEdit(lapso)}
                  className="cursor-pointer"
                >
                  Editar
                </DropdownMenuItem>
              </Guard>
              <Guard requiredPermissions="lapso.eliminar">
                <DropdownMenuItem
                  onSelect={() => onDelete(lapso)}
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
];
