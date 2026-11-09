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
import { MoreHorizontal, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Función que genera el badge dinámico según la acción de la bitácora
 */
const renderAccionBadge = (accion) => {
    const normalizado = accion?.toUpperCase();

    switch (normalizado) {
        case "INSERTAR":
            return (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-medium">
                    Insertar
                </Badge>
            );
        case "MODIFICAR":
            return (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 font-medium">
                    Modificar
                </Badge>
            );
        case "ELIMINAR":
            return (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 font-medium">
                    Eliminar
                </Badge>
            );
        default:
            return <Badge variant="outline">{accion || "N/A"}</Badge>;
    }
};

export const columnsBitacora = (onViewDetails) => [
    {
        accessorKey: "user",
        header: "Usuario",
        accessorFn: (row) => row.user?.name || row.user?.email || "Sistema",
        cell: ({ row }) => {
            const name = row.original.user?.name || "Sistema";
            const email = row.original.user?.email || "";
            return (
                <div className="flex flex-col">
                    <span className="font-medium uppercase text-sm">
                        {name.toLowerCase()}
                    </span>
                    {email && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {email}
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "accion",
        header: "Acción",
        cell: ({ row }) => renderAccionBadge(row.original.accion),
    },
    {
        accessorKey: "tabla",
        header: "Módulo / Tabla",
        cell: ({ row }) => (
            <span className="font-semibold uppercase text-xs">
                {row.original.tabla || "N/A"}
            </span>
        ),
    },
    {
        accessorKey: "registro_id",
        header: "Registro ID",
        cell: ({ row }) => (
            <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                {row.original.registro_id || "N/A"}
            </span>
        ),
    },
    {
        accessorKey: "ip_address",
        header: "IP Address",
        cell: ({ row }) => (
            <span className="text-xs text-slate-500 dark:text-slate-400">
                {row.original.ip_address || "N/A"}
            </span>
        ),
    },
    {
        accessorKey: "created_at",
        header: "Fecha y Hora",
        cell: ({ row }) => {
            const dateStr = row.original.created_at;
            if (!dateStr) return "N/A";
            const date = new Date(dateStr);
            const formattedDate = new Intl.DateTimeFormat("es-VE", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).format(date);
            return (
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {formattedDate}
                </span>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const bitacora = row.original;

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
                                onClick={() => onViewDetails(bitacora)}
                                className="cursor-pointer flex items-center gap-2 text-slate-700 dark:text-slate-300"
                            >
                                <Eye className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                                Ver Detalles
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
