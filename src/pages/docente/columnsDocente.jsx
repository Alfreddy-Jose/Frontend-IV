import React from 'react'
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Guard } from '@/components/shared/Guard';

export const columnsDocente = (onEdit, onDelete) => [
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
    accessorKey: "persona",
    header: "Cédula",
    cell: ({ row }) => {
      const cedula_persona = row.getValue("persona").cedula_persona;
      return <div className="font-medium">{cedula_persona}</div>;
    },
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => {
      const nombre = row.getValue("persona").nombre;
      return <div className="font-medium uppercase">{nombre}</div>;
    },
  },
  {
    accessorKey: "apellido",
    header: "Apellido",
    cell: ({ row }) => {
      const apellido = row.getValue("persona").apellido;
      return <div className="font-medium uppercase">{apellido}</div>;
    },
  },
  {
    accessorKey: "pnf",
    header: "PNF",
    cell: ({ row }) => {
      const pnf = row.getValue("pnf");
      return <div className="font-medium">{pnf.nombre}</div>;
    },
  },
  {
    accessorKey: "condicion_contrato",
    header: "Dedicación",
    cell: ({ row }) => {
      const condicion_contrato = row.getValue("condicion_contrato");
      return <div className="font-medium">{condicion_contrato.dedicacion}</div>;
    },
  },
  {
    accessorKey: "fecha_inicio",
    header: "Fecha Inicio",
    cell: ({ row }) => {
      const fecha_inicio = row.getValue("condicion_contrato").fecha_inicio;
      return <div className="font-medium">{new Date(fecha_inicio).toLocaleDateString("es-ES")}</div>;
    },
  },
  {
    accessorKey: "fecha_fin",
    header: "Fecha Fin",
    cell: ({ row }) => {
      const fecha_fin = row.getValue("condicion_contrato").fecha_fin;
      return <div className="font-medium">{new Date(fecha_fin).toLocaleDateString("es-ES")}</div>;
    },
  },
  {
    accessorKey: "horas_dedicacion",
    header: "Horas Académicas",
    cell: ({ row }) => {
      const horas_dedicacion = row.getValue("horas_dedicacion");
      return <div className="font-medium uppercase">{horas_dedicacion}</div>;
    },
  },
  {
    accessorKey: "categoria",
    header: "Categoría",
    cell: ({ row }) => {
      const categoria = row.getValue("categoria");
      return <div className="font-medium uppercase">{categoria}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const pnf = row.original;

      return (
        <Guard requiredPermissions={["docente.editar", "docente.eliminar"]}>
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
              <Guard requiredPermissions="docente.editar">
                <DropdownMenuItem
                  onClick={() => onEdit(pnf)}
                  className="cursor-pointer"
                >
                  Editar
                </DropdownMenuItem>
              </Guard>
              <Guard requiredPermissions="docente.eliminar">
                <DropdownMenuItem
                  onSelect={() => onDelete(pnf)}
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
]
