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
import { MoreHorizontal } from "lucide-react";
import { Guard } from "@/components/shared/Guard";

export const columnsUnidadCurricular = (onEdit, onDelete) => [
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
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("nombre")}</div>
    ),
  },
  {
    accessorKey: "unidad_credito",
    header: "Unidad Crédito",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("unidad_credito")}</div>
    ),
  },
  {
    accessorKey: "hora_practica",
    header: "H.Práctica",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue("hora_practica") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "hora_teorica",
    header: "H.Teórica",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("hora_teorica")}</div>
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
    accessorKey: "hora_total_est",
    header: "H. Totales",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("hora_total_est")}</div>
    ),
  },
  {
    accessorKey: "trimestres",
    header: "Trimestres",
    cell: ({ row }) => {
      const trimestres = row.getValue("trimestres");
      return (
        <div className="font-medium">
          {Array.isArray(trimestres) && trimestres.length > 0
            ? trimestres.map((trimestre, idx) => (
              <span key={trimestre.id}>
                {trimestre.nombre}{idx < trimestres.length - 1 ? ', ' : ''}
              </span>
            ))
            : "N/A"}
        </div>
      );
    },
  },
  {
    id: "trayecto",
    header: "Trayecto",
    cell: ({ row }) => {
      const trimestres = row.getValue("trimestres");
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
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("descripcion") || "N/A"}</div>
    ),
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
              <Guard requiredPermissions="unidad Curricular.editar">
                <DropdownMenuItem
                  onClick={() => onEdit(uc)}
                  className="cursor-pointer"
                >
                  Editar
                </DropdownMenuItem>
              </Guard>
              <Guard requiredPermissions="unidad Curricular.eliminar">
                <DropdownMenuItem
                  onSelect={() => onDelete(uc)}
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
