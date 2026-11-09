import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, SquarePen, Eye } from "lucide-react";
import { Guard } from "@/components/shared/Guard";

export const columnsUnidadCurricular = (onEdit, onDelete, onShow) => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("nombre")}</div>
    ),
  },
  {
    accessorKey: "periodo",
    header: "Periodo",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue("periodo") === "1" ? "TRIMESTRAL"
          : row.getValue("periodo") === "2" ? "SEMESTRAL"
            : row.getValue("periodo") === "3" ? "ANUAL"
              : row.getValue("periodo") ? row.getValue("periodo") : "N/A"}
      </div>
    ),
  },
  {
    id: "trayecto",
    header: "Trayecto",
    cell: ({ row }) => {
      const trimestres = row.original.trimestres;
      const trayecto = Array.isArray(trimestres) && trimestres.length > 0 ? trimestres[0].trayecto : null;
      return (
        <div className="font-medium">
          {trayecto ? (
            <span>{trayecto}</span>
          ) : (
            "N/A"
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const uc = row.original;

      return (
        <Guard requiredPermissions={["unidad Curricular.editar", "unidad Curricular.eliminar"]}>
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
              <DropdownMenuItem
                onClick={() => onShow(uc)}
                className="cursor-pointer"
              >
                <Eye className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                Ver detalles
              </DropdownMenuItem>
              <Guard requiredPermissions="unidad Curricular.editar">
                <DropdownMenuItem
                  onClick={() => onEdit(uc)}
                  className="cursor-pointer"
                >
                  <SquarePen className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                  Editar
                </DropdownMenuItem>
              </Guard>
              <Guard requiredPermissions="unidad Curricular.eliminar">
                <DropdownMenuItem
                  onSelect={() => onDelete(uc)}
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
