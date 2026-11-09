import React from 'react'
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, SquarePen, Eye } from 'lucide-react';
import { Guard } from '@/components/shared/Guard';

export const columnsPersonas = (onEdit, onShow, onDelete) => [
  {
    accessorKey: "cedula_persona",
    header: "Cédula",
    cell: ({ row }) => {
      const cedula_persona = row.getValue("cedula_persona");
      return <div className="font-medium">{cedula_persona}</div>;
    },
  },
  {
    accessorKey: "nombre",
    header: "Nombre Completo",
    cell: ({ row }) => {
      const nombre = row.getValue("nombre") || row.original?.nombre || "";
      const apellidoFromValue = row.getValue("apellido");
      const apellido = apellidoFromValue !== undefined ? apellidoFromValue : (row.original?.apellido || "");
      const fullName = `${nombre} ${apellido}`.trim();
      return <div className="font-medium uppercase">{fullName || 'N/A'}</div>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email");
      return <div className="font-medium">{email}</div>;
    },
  },
  {
    accessorKey: "tipo_persona",
    header: "Tipo Persona",
    cell: ({ row }) => {
      const tipo_persona = row.getValue("tipo_persona");
      return <div className="font-medium uppercase">{tipo_persona}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const persona = row.original;

      return (
        <Guard requiredPermissions={["persona.editar", "persona.eliminar"]}>
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
              <DropdownMenuItem onClick={() => onShow(persona)} className="cursor-pointer">
                <Eye className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                Ver Detalles
              </DropdownMenuItem>

              {/* Opción para Editar */}
              <Guard requiredPermissions="persona.editar">
                <DropdownMenuItem
                  onClick={() => onEdit(persona)}
                  className="cursor-pointer"
                >
                  <SquarePen className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                  Editar
                </DropdownMenuItem>
              </Guard>

              {/* Opción para Eliminar */}
              <Guard requiredPermissions="persona.eliminar">
                <DropdownMenuItem
                  onSelect={() => onDelete(persona)}
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
]
