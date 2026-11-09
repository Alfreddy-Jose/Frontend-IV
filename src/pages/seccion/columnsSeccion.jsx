import React from "react";
import { MoreHorizontal, Trash2, SquarePen, Eye } from "lucide-react";
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
import { Guard } from "@/components/shared/Guard";

export const columns = (onEdit, onDelete, onShow) => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => {
      const valor = row.getValue("nombre");
      return <div className="font-medium">{valor || "N/A"}</div>;
    },
  },
  {
    accessorKey: "pnf",
    header: "PNF",
    cell: ({ row }) => {
      const valor = row.getValue("pnf");
      return <div className="font-medium">{valor?.nombre || "N/A"}</div>;
    },
  },
  {
    accessorKey: "trayecto",
    header: "Trayecto",
    cell: ({ row }) => {
      const valor = row.getValue("trayecto");
      return <div className="font-medium">{valor?.nombre || "N/A"}</div>;
    },
  },
  {
    accessorKey: "matricula",
    header: "Matrícula",
    cell: ({ row }) => {
      const valor = row.getValue("matricula");
      return <div className="font-medium">{valor?.nombre || "N/A"}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const seccion = row.original;

      return (
        <Guard requiredPermissions={["seccion.editar", "seccion.eliminar"]}>
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
                onClick={() => onShow(seccion)}
                className="cursor-pointer"
              >
                <Eye className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                Ver Detalles
              </DropdownMenuItem>

              <Guard requiredPermissions="seccion.editar">
                <DropdownMenuItem
                  onClick={() => onEdit(seccion)}
                  className="cursor-pointer"
                >
                  <SquarePen className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                  Editar
                </DropdownMenuItem>
              </Guard>
              <Guard requiredPermissions="seccion.eliminar">
                <DropdownMenuItem
                  onSelect={() => onDelete(seccion)}
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
];