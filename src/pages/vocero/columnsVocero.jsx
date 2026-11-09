import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, SquarePen, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Función que genera el badge dinámico según el tipo de vocería
 */
const renderTipoVoceroBadge = (tipo) => {
  const normalizado = tipo?.toUpperCase();

  switch (normalizado) {
    case "PRINCIPAL":
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-medium">
          Principal
        </Badge>
      );
    case "SUPLENTE":
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-medium">
          Suplente
        </Badge>
      );
    default:
      return <Badge variant="outline">{tipo || "Sin asignar"}</Badge>;
  }
};

export const columnsVocero = (onViewDetails, onDelete) => [
  // 1. Cédula del Estudiante (Columna filtrable principal)
  {
    accessorKey: "cedula",
    accessorFn: (row) =>
      row.estudiante?.persona?.cedula_persona ||
      row.estudiante?.cedula ||
      "N/A",
    cell: ({ row }) => {
      const cedula =
        row.original.estudiante?.persona?.cedula_persona ||
        row.original.estudiante?.cedula ||
        "N/A";
      return <span className="font-medium">{cedula}</span>;
    },
  },

  // 2. Nombre Completo del Estudiante
  {
    accessorKey: "nombre",
    accessorFn: (row) => {
      const persona = row.estudiante?.persona;
      return persona
        ? `${persona.nombre || ""} ${persona.apellido || ""}`.trim()
        : "N/A";
    },
    cell: ({ row }) => {
      const persona = row.original.estudiante?.persona;
      const nombreCompleto = persona
        ? `${persona.nombre} ${persona.apellido}`
        : "Nombre no disponible";

      return (
        <div className="flex flex-col">
          <span className="font-medium uppercase">
            {nombreCompleto.toLowerCase()}
          </span>
        </div>
      );
    },
  },

  // 3. Sección representada
  {
    accessorKey: "seccion",
    header: "Sección",
    accessorFn: (row) => row.seccion?.nombre || "N/A",
    cell: ({ row }) => (
      <span className="font-semibold uppercase">
        {row.original.seccion?.nombre || "N/A"}
      </span>
    ),
  },

  // 4. Tipo de Vocería (Badge)
  {
    accessorKey: "tipo_vocero",
    header: "Tipo de Vocería",
    cell: ({ row }) => renderTipoVoceroBadge(row.original.tipo_vocero),
  },

  // 5. Lapso Académico asociativo
  {
    accessorKey: "lapso",
    header: "Lapso",
    accessorFn: (row) => row.seccion?.lapso?.nombre_lapso || "N/A",
    cell: ({ row }) => (
      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
        {row.original.seccion?.lapso?.nombre_lapso || "N/A"}
      </span>
    ),
  },

  // 6. Columna de Acciones
  {
    id: "actions",
    cell: ({ row }) => {
      const vocero = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {onViewDetails && (
              <DropdownMenuItem
                onClick={() => onViewDetails(vocero)}
                className="cursor-pointer flex items-center gap-2 text-slate-700 dark:text-slate-300"
              >
                <Eye className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                Ver Detalles
              </DropdownMenuItem>
            )}

            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(vocero)}
                  className="bg-red-50 text-red-700 focus:text-destructive focus:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:focus:bg-red-950 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 text-red-700 dark:text-red-300" />
                  Desvincular
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
