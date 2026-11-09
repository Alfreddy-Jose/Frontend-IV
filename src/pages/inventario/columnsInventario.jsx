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
import { MoreHorizontal, Eye, Trash2, SquarePen, CheckCircle2, AlertTriangle, ArchiveX, RefreshCw } from "lucide-react";
import { Guard } from "@/components/shared/Guard";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon } from "lucide-react"; // Importar icono auxiliar

export const columnsInventario = (onViewDetails, onDelete, onEdit, onChangeEstatus) => [
    {
        accessorKey: "codigo_uni",
        header: "Código",
        cell: ({ row }) => {
            // Maneja tanto si viene directo del modelo Bien como si viene anidado en el reporte
            const codigo = row.original.codigo_uni || row.original.bien?.codigo_uni || "S/C";
            return (
                <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {codigo}
                </div>
            );
        },
    },
    {
        accessorKey: "nombre",
        header: "Bien / Equipo",
        cell: ({ row }) => {
            const nombre = row.original.nombre || row.original.bien?.nombre || "Sin nombre";
            const serial = row.original.serial || row.original.bien?.serial;

            return (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                        {nombre}
                    </span>
                    {serial && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                            S/N: {serial}
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "descripcion",
        header: "Descripción",
        cell: ({ row }) => {
            const descripcion = row.original.descripcion || row.original.bien?.descripcion || "Sin detalles";
            return (
                <div className="max-w-[250px] truncate text-slate-600 dark:text-slate-400 text-sm" title={descripcion}>
                    {descripcion}
                </div>
            );
        },
    },
    {
        accessorKey: "estado_operativo",
        header: "Estado Físico",
        cell: ({ row }) => {
            // Obtiene el estado del objeto de reporte o del último reporte asociado
            const estado = row.original.estado_operativo || row.original.ultimo_reporte?.estado_operativo || "operativo";

            if (estado === "operativo") {
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 capitalize font-semibold shadow-sm px-2.5 py-1 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800 inline-flex items-center gap-1.5"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                        Operativo
                    </Badge>
                );
            }

            if (estado === "dañado") {
                return (
                    <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200 capitalize font-semibold shadow-sm px-2.5 py-1 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800 inline-flex items-center gap-1.5"
                    >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Dañado
                    </Badge>
                );
            }

            if (estado === "desincorporado") {
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200 capitalize font-semibold shadow-sm px-2.5 py-1 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800 inline-flex items-center gap-1.5"
                    >
                        <ArchiveX className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        Desincorporado
                    </Badge>
                );
            }

            return <span className="capitalize font-medium">{estado}</span>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const item = row.original;

            return (
                <Guard requiredPermissions={["inventario.ver", "inventario.editar", "inventario.eliminar"]}>
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

                            {/* Ver Detalles */}
                            {onViewDetails && (
                                <Guard requiredPermissions="inventario.ver">
                                    <DropdownMenuItem
                                        onClick={() => onViewDetails(item)}
                                        className="cursor-pointer"
                                    >
                                        <Eye className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                                        Ver Detalles
                                    </DropdownMenuItem>
                                </Guard>
                            )}

                                                        {/* Cambiar Estatus */}
                            {onChangeEstatus && (
                                <Guard requiredPermissions="inventario.editar">
                                    <DropdownMenuItem
                                        onClick={() => onChangeEstatus(item)}
                                        className="cursor-pointer"
                                    >
                                        <RefreshCw className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        Cambiar Estatus
                                    </DropdownMenuItem>
                                </Guard>
                            )}

                            {/* Editar Bien */}
                            {onEdit && (
                                <Guard requiredPermissions="inventario.editar">
                                    <DropdownMenuItem
                                        onClick={() => onEdit(item)}
                                        className="cursor-pointer"
                                    >
                                        <SquarePen className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                                        Editar
                                    </DropdownMenuItem>
                                </Guard>
                            )}

                            {/* Eliminar Bien */}
                            {onDelete && (
                                <Guard requiredPermissions="inventario.eliminar">
                                    <DropdownMenuItem
                                        onSelect={() => onDelete(item)}
                                        className="bg-red-50 text-red-700 focus:text-destructive focus:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:focus:bg-red-950 cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-700 dark:text-red-300" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </Guard>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Guard>
            );
        },
    },
];