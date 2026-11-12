import React from "react";

import { MoreHorizontal, Eye, Trash2, SquarePen } from "lucide-react";

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
// import { Guard } from '@/components/shared/Guard';

export const columnsCenso = (handleViewDetails, onEdit, onDelete) => [
  {
    accessorKey: "cedula",
    header: "Cédula",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div>
          {item.estudiante?.cedula_persona ||
            item.estudiante?.persona?.cedula_persona ||
            "N/A"}
        </div>
      );
    },
  },
  {
    id: "nombre",
    accessorFn: (row) =>
      row.estudiante?.nombre || row.estudiante?.persona?.nombre || "",
    header: "Nombre",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="uppercase">
          {item.estudiante?.nombre || item.estudiante?.persona?.nombre || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "apellido",
    header: "Apellido",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="uppercase">
          {item.estudiante?.apellido ||
            item.estudiante?.persona?.apellido ||
            "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "seccion",
    header: "Sección",
    cell: ({ row }) => {
      const item = row.original;
      const seccion =
        item.estudiante?.estudiante?.secciones?.[0]?.nombre ||
        item.estudiante?.secciones?.[0]?.nombre ||
        "N/A";
      return <div className="uppercase">{seccion}</div>;
    },
  },
  {
    accessorKey: "tipo_censo",
    header: "Tipo de Censo",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="font-semibold text-xs text-indigo-600 dark:text-indigo-400">
          {item.tipo_censo}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const censo = row.original;
      const estado = censo.estado;

      if (estado === "cerrado" || estado === "activo") {
        return null;
      }

      return (
        <Guard requiredPermissions={["censo.ver", "censo.editar", "censo.eliminar"]}>
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

              {/* opcion de ver detalles */}
              <Guard requiredPermissions="censo.ver">
                <DropdownMenuItem
                  onClick={() => handleViewDetails(censo)}
                  className="cursor-pointer flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <Eye className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                  Ver Detalles
                </DropdownMenuItem>
              </Guard>

              {/* opcion de editar */}
              <Guard requiredPermissions="censo.editar">
                <DropdownMenuItem
                  onClick={() => onEdit(censo)}
                  className="cursor-pointer"
                >
                  <SquarePen className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                  Editar
                </DropdownMenuItem>
              </Guard>

              {/* opcion de eliminar */}
              <Guard requiredPermissions="censo.eliminar">
                <DropdownMenuItem
                  onSelect={() => onDelete(censo)}
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
