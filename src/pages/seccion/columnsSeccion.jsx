import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Guard } from "@/components/shared/Guard";

export const columns = (onEdit, onDelete) => [
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
    cell: ({ row }) => {
      const valor = row.getValue("nombre");
      return <div className="font-medium">{valor || "N/A"}</div>;
    },
  },
  {
    accessorKey: "pnf",
    header: "PNF",
    cell: ({ row }) => {
      const valor = row.getValue("pnf");
      return <div className="font-medium">{valor.nombre || "N/A"}</div>;
    },
  },
  {
    accessorKey: "lapso",
    header: "Lapso",
    cell: ({ row }) => {
      const valor = row.getValue("lapso");
      return <div className="font-medium">{valor.nombre_lapso || "N/A"}</div>;
    },
  },
  {
    accessorKey: "trayecto",
    header: "Trayecto",
    cell: ({ row }) => {
      const valor = row.getValue("trayecto");
      return <div className="font-medium">{valor.nombre || "N/A"}</div>;
    },
  },
  {
    accessorKey: "matricula",
    header: "Matrícula",
    cell: ({ row }) => {
      const valor = row.getValue("matricula");
      return <div className="font-medium">{valor.nombre || "N/A"}</div>;
    },
  },
  {
    accessorKey: "sede",
    header: "Sede",
    cell: ({ row }) => {
      const valor = row.getValue("sede");
      return <div className="font-medium">{valor.nombre_sede || "N/A"}</div>;
    },
  },
  {
    accessorKey: "numero_seccion",
    header: "Numero de Sección",
    cell: ({ row }) => {
      const valor = row.getValue("numero_seccion");
      return <div className="font-medium">{valor || "N/A"}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const seccion = row.original;

      return (
        <Guard requiredPermissions={["seccion.editar", "seccion.eliminar"]}>
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
              <Guard requiredPermissions="seccion.editar">
                <DropdownMenuItem onClick={() => onEdit(seccion)} className="cursor-pointer">Editar</DropdownMenuItem>
              </Guard>
              <Guard requiredPermissions="seccion.eliminar">
                <DropdownMenuItem
                  onSelect={() => onDelete(seccion)}
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
