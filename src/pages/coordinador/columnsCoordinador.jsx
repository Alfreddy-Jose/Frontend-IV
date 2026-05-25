import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Guard } from '@/components/shared/Guard';

/**
 * Definición de columnas para la DataTable de Coordinadores.
 * @param {(coordinador: any) => void} onDelete Callback para eliminar el registro.
 */
export const columnsCoordinador = (onDelete) => [
  // 1. COLUMNA DE SELECCIÓN (CHECKBOX)
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
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

  // 2. COLUMNA CÉDULA (Extrayendo de docente.persona)
  {
    id: 'cedula',
    header: 'Cédula',
    cell: ({ row }) => {
      const cedula = row.original.docente?.persona?.cedula_persona;
      return <div className="font-medium">{cedula || 'N/A'}</div>;
    },
  },

  // 3. COLUMNA COORDINADOR (Nombre + Apellido)
  {
    id: 'nombre',
    header: 'Coordinador',
    cell: ({ row }) => {
      const persona = row.original.docente?.persona;
      const nombreCompleto = persona
        ? `${persona.nombre} ${persona.apellido}`
        : 'SIN ASIGNAR';
      return <div className="font-medium uppercase">{nombreCompleto}</div>;
    },
  },

  // 4. COLUMNA PNF (Extrayendo de docente.pnf)
  {
    id: 'pnf_nombre',
    header: 'Programa Nacional de Formación (PNF)',
    cell: ({ row }) => {
      const pnfNombre = row.original.docente?.pnf?.nombre;
      return (
        <div className="font-medium text-xs max-w-[350px] truncate" title={pnfNombre}>
          {pnfNombre || 'N/A'}
        </div>
      );
    },
  },

  // 5. COLUMNA FECHA INICIO (Formateando el timestamp)
  {
    accessorKey: 'fecha_inicio',
    header: 'Fecha de Inicio',
    cell: ({ row }) => {
      const rawDate = row.getValue('fecha_inicio');
      const fechaLimpia = rawDate
        ? new Date(rawDate).toLocaleDateString("es-ES", { timeZone: "UTC" })
        : 'N/A';
      return <div className="font-medium">{fechaLimpia}</div>;
    },
  },

  // 6. COLUMNA ACCIONES (Dropdown Menu)
  {
    id: 'actions',
    cell: ({ row }) => {
      const coordinador = row.original;
      return (
        <Guard requiredPermissions={["coordinador.eliminar"]}>
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
              <Guard requiredPermissions="coordinador.eliminar">
                <DropdownMenuItem
                  onSelect={() => onDelete(coordinador)}
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
    enableSorting: false,
    enableHiding: false,
  },
];