import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Lock, Trash2, SquarePen } from "lucide-react";
import { Guard } from "@/components/shared/Guard";
import { Badge } from "@/components/ui/badge";

export const columnsAnos = (onEdit, onDelete, onStatusChange) => [
  {
    accessorKey: "ano",
    header: "Año",
    cell: ({ row }) => {
      const ano = row.getValue("ano");
      return <div className="font-medium text-slate-800 dark:text-slate-200">{ano}</div>;
    },
  },
  {
    accessorKey: "fecha_inicio",
    header: "Fecha de Inicio",
    cell: ({ row }) => {
      const fecha_inicio = row.getValue("fecha_inicio");
      return <div className="font-medium text-slate-700 dark:text-slate-300">{fecha_inicio}</div>;
    },
  },
  {
    accessorKey: "fecha_fin",
    header: "Fecha de Fin",
    cell: ({ row }) => {
      const fecha_fin = row.getValue("fecha_fin");
      return <div className="font-medium text-slate-700 dark:text-slate-300">{fecha_fin}</div>;
    },
  },
  {
    accessorKey: "estado_real",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.original.estado_real;
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
      const ano = row.original;
      const estado = ano.estado_real;

      // El switch se muestra encendido SOLAMENTE si está activo
      const isChecked = estado === "activo";
      
      // Si ya está cerrado, el switch se congela por completo
      const isDisabled = estado === "cerrado";

      const handleSwitchChange = (checked) => {
        if (checked && estado === "planificacion") {
          // El usuario enciende el switch: pasa de planificación a activo
          onStatusChange(ano, "activar");
        } else if (!checked && estado === "activo") {
          // El usuario apaga el switch: pasa de activo a cerrado
          onStatusChange(ano, "cerrar");
        }
      };

      return (
        <Guard requiredPermissions={["anoAcademico.editar"]}>
          <div className="flex items-center justify-start min-w-[60px]">
            <Switch
              checked={isChecked}
              disabled={isDisabled}
              onCheckedChange={handleSwitchChange}
              className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700 cursor-pointer"
              aria-label="Cambiar estado del periodo académico"
            />
          </div>
        </Guard>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const ano = row.original;
      const estado = ano.estado_real;

      if (estado === "cerrado" || estado === "activo") {
        return null;
      }

      return (
        <Guard requiredPermissions={["anoAcademico.editar", "anoAcademico.eliminar"]}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Guard requiredPermissions="anoAcademico.editar">
                <DropdownMenuItem
                  onClick={() => onEdit(ano)}
                  className="cursor-pointer"
                >
                  <SquarePen className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                  Editar
                </DropdownMenuItem>
              </Guard>
              <Guard requiredPermissions="anoAcademico.eliminar">
                <DropdownMenuItem
                  onSelect={() => onDelete(ano)}
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
