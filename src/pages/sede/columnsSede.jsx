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
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";

// Define las columnas para la DataTable
export const columns = (onEdit, onDelete) => [
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
    accessorKey: "nro_sede",
    header: "Número de Sede",
    cell: ({ row }) => {
      const numero = row.getValue("nro_sede");
      return <div className="font-medium">{numero}</div>;
    },
  },
  {
    accessorKey: "nombre_sede",
    header: "Nombre de Sede",
    cell: ({ row }) => {
      const nombre = row.getValue("nombre_sede");
      return <div className="font-medium">{nombre}</div>;
    },
  },
  {
    accessorKey: "nombre_abreviado",
    header: "Nombre Abreviado",
    cell: ({ row }) => {
      const nombreAbreviado = row.getValue("nombre_abreviado");
      return <div className="font-medium">{nombreAbreviado}</div>;
    },
  },
  {
    accessorKey: "municipio",
    header: "Municipio",
    cell: ({ row }) => {
      const municipio = row.getValue("municipio");
      return <div className="font-medium">{municipio.municipio}</div>;
    },
  },
  {
    accessorKey: "direccion",
    header: "Dirección",
    cell: ({ row }) => {
      const direccion = row.getValue("direccion");
      return <div className="font-medium">{direccion}</div>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const sede = row.original;

      return (
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
            <DropdownMenuItem onClick={() => onEdit(sede)}>Editar</DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onDelete(sede)} // Evita que el menú se cierre antes que el modal
                className="bg-red-50 text-red-700 focus:text-destructive focus:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:focus:bg-red-950 cursor-pointer"
              >
                Eliminar
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];