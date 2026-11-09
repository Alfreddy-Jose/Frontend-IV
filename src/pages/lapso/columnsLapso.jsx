import React from 'react'

import { MoreHorizontal, Lock, SquarePen, Trash2 } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";

export const columnsLapso = (onEdit, onDelete, onForzarInicio, onForzarCierre) => [
  {
    accessorKey: "nombre_lapso",
    header: "Nombre",
    cell: ({ row }) => {
      const nombre_lapso = row.getValue("nombre_lapso");
      return <div className="font-medium">{nombre_lapso}</div>;
    },
  },
  {
    accessorKey: "ano_perteneciente",
    header: "Año",
    cell: ({ row }) => {
      const ano = row.getValue("ano_perteneciente");
      return <div className="font-medium">{ano}</div>;
    },
  },
  // Tipo de lapso
  {
    accessorKey: "tipo_nombre",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo_lapso = row.getValue("tipo_nombre");
      return <div className="font-medium">{tipo_lapso}</div>;
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
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.original.estado;
      if (estado === "activo") {
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 capitalize font-semibold shadow-sm px-2.5 py-1 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
          >
            Activo
          </Badge>
        );
      }
      if (estado === "planificacion") {
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 capitalize font-semibold shadow-sm px-2.5 py-1 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800"
          >
            Planificación
          </Badge>
        );
      }
      if (estado === "cerrado") {
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 capitalize font-semibold shadow-sm px-2.5 py-1 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800 inline-flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            Cerrado
          </Badge>
        );
      }
      return <span className="capitalize font-medium">{estado}</span>;
    },
  },
  {
    id: "switch_estado",
    header: "Control de Estado",
    cell: ({ row }) => {
      const lapso = row.original;
      const estado = lapso.estado;

      // SOLUCIÓN: Buscamos el estado del año en las propiedades directas del objeto mapeado.
      // Revisa si tu JSON lo envía como 'ano_real_estado' o dentro del objeto del año.
      // Como alternativa segura, evaluamos si el backend te lo envía directamente:
      const estadoAnoPadre = lapso.ano_real_estado || lapso.ano_academico?.estado_real;

      const isChecked = estado === "activo";

      // CORRECCIÓN: El lapso se bloquea si ya está cerrado (ciclo terminado)
      // O si el año académico padre NO está activo (está en planificación o cerrado)
      const isDisabled = estado === "cerrado" || estadoAnoPadre !== "activo";

      const handleSwitchChange = (checked) => {
        if (checked && estado === "planificacion") {
          onForzarInicio(lapso, "activar");
        } else if (!checked && estado === "activo") {
          onForzarCierre(lapso, "cerrar");
        }
      };

      return (
        <Guard requiredPermissions={["lapso.editar"]}>
          <div className="flex items-center justify-start min-w-[60px]">
            <Switch
              checked={isChecked}
              disabled={isDisabled}
              onCheckedChange={handleSwitchChange}
              className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700 cursor-pointer"
              aria-label="Cambiar estado del lapso académico"
            />
          </div>
        </Guard>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const lapso = row.original;
      const estado = lapso.estado;

      if (estado === "cerrado" || estado === "activo") {
        return null;
      }


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
                  <SquarePen className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                  Editar
                </DropdownMenuItem>
              </Guard>
              <Guard requiredPermissions="lapso.eliminar">
                <DropdownMenuItem
                  onSelect={() => onDelete(lapso)}
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
