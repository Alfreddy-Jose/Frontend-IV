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
import { Guard } from "@/components/shared/Guard";

export const columnsPer = (handleViewDetails, onEdit, onDelete) => [  
    {
        id: "estudiante",
        accessorFn: (row) => {
            const persona = row.estudiante?.persona;
            return persona ? `${persona.nombre || ""} ${persona.apellido || ""}`.trim() : "";
        },
        header: "Estudiante",
        cell: ({ row }) => {
            const item = row.original;
            return (
              <div className="uppercase">
                {item.estudiante?.persona?.nombre} {item.estudiante?.persona?.apellido}
              </div>
            );
        },
    },
    {
        accessorKey: "docente",
        header: "Docente Evaluador",
        cell: ({ row }) => {
            const item = row.original;
            return (
              <div className="uppercase">
                {/* Concatenar el nombre y el apellido */}
                {item.docente?.persona?.nombre} {item.docente?.persona?.apellido}
              </div>
            );
        },
    },
        {
        accessorKey: "unidadCurricular",
        header: "Unidad Curricular",
        cell: ({ row }) => {
            const item = row.original;
            return (
              <div className="uppercase">
                {/* Concatenar el nombre y el apellido */}
                {item.unidad_curricular?.nombre}
              </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const per = row.original;

            return (
                <Guard requiredPermissions={["per.editar", "per.eliminar"]}>
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
                            <DropdownMenuItem
                                onClick={() => handleViewDetails(per)}
                                className="cursor-pointer flex items-center gap-2 text-slate-700 dark:text-slate-300"
                            >
                                <Eye className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                                Ver Detalles
                            </DropdownMenuItem>

                            {/* opcion de editar */}
                            <Guard requiredPermissions="per.editar">
                                <DropdownMenuItem
                                    onClick={() => onEdit(per)}
                                    className="cursor-pointer flex items-center gap-2"
                                >
                                    <SquarePen className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                                    Editar
                                </DropdownMenuItem>
                            </Guard>

                            {/* opcion de eliminar */}
                            <Guard requiredPermissions="per.eliminar">
                                <DropdownMenuItem
                                    onSelect={() => onDelete(per)}
                                    className="bg-red-50 text-red-700 focus:text-destructive focus:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:focus:bg-red-950 cursor-pointer flex items-center gap-2"
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
