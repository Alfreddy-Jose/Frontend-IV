import React from 'react'
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export const columnsPersonas = (onEdit, onDelete) => [
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
    accessorKey: "cedula_persona",
    header: "Cédula",
    cell: ({ row }) => {
      const cedula_persona = row.getValue("cedula_persona");
      return <div className="font-medium">{cedula_persona}</div>;
    },
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => {
      const nombre = row.getValue("nombre");
      return <div className="font-medium">{nombre}</div>;
    },
  },
  {
    accessorKey: "apellido",
    header: "Apellido",
    cell: ({ row }) => {
      const apellido = row.getValue("apellido");
      return <div className="font-medium">{apellido}</div>;
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
    accessorKey: "telefono",
    header: "Telefono",
    cell: ({ row }) => {
      const telefono = row.getValue("telefono");
      return <div className="font-medium">{telefono}</div>;
    },
  },
  {
    accessorKey: "tipo_persona",
    header: "Tipo Persona",
    cell: ({ row }) => {
      const tipo_persona = row.getValue("tipo_persona");
      return <div className="font-medium">{tipo_persona}</div>;
    },
  },
  {
    accessorKey: "grado_inst",
    header: "Instrucción",
    cell: ({ row }) => {
      const grado_inst = row.getValue("grado_inst");
      return <div className="font-medium">{grado_inst}</div>;
    },
  },
  {
    accessorKey: "municipio",
    header: "Municipio",
    cell: ({ row }) => {
      const municipio = row.getValue("municipio");
      return <div className="font-medium">{municipio.municipio}</div>;
    },
  },
  {
    accessorKey: "direccion",
    header: "Dirección",
    cell: ({ row }) => {
      const direccion = row.getValue("direccion");
      return <div className="font-medium">{direccion}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const persona = row.original;

      return (
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
              onClick={() => onEdit(persona)}
              className="cursor-pointer"
            >
              Editar
            </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onDelete(persona)}
                className="bg-red-50 text-red-700 focus:text-destructive focus:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:focus:bg-red-950 cursor-pointer"
              >
                Eliminar
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },  
]
