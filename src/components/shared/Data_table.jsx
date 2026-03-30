import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { ModernInput } from "./InputModerno";
import { Label } from "@/components/ui/label"; // Asegúrate de tener este componente
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DataTable({ columns, data, filterColumn, statusFilterColumn = "status", statusFilterOptions }) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnSelection, setColumnSelection] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState({});
  
  const hasRowSelection = Object.keys(rowSelection).length > 0;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      {/* SECCIÓN DE FILTROS SUPERIOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 p-4 backdrop-blur-sm rounded-t-xl border border-b-0 border-gray-100 dark:border-slate-800">
        {filterColumn && table.getColumn(filterColumn) && (
          <div className="relative w-full max-w-sm">
            <ModernInput
              placeholder={`Buscar por ${filterColumn}...`}
              value={table.getColumn(filterColumn)?.getFilterValue() ?? ""}
              onChange={(event) => {
                setColumnSelection("all");
                table.getColumn("status")?.setFilterValue(undefined);
                table.getColumn(filterColumn)?.setFilterValue(event.target.value);
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {hasRowSelection && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                const selectedRowIds = table
                  .getSelectedRowModel()
                  .rows.map((row) => row.original.id);
                console.log("Eliminando:", selectedRowIds);
              }}
            >
              Eliminar seleccionados
            </Button>
          )}

          {statusFilterOptions && statusFilterOptions.length > 0 && table.getColumn(statusFilterColumn) && (
            <Select
              value={columnSelection}
              onValueChange={(value) => {
                setColumnSelection(value);
                table.getColumn(statusFilterColumn)?.setFilterValue(value === "all" ? undefined : value);
              }}
            >
              <SelectTrigger className="w-full max-w-[150px] capitalize">
                <SelectValue placeholder={statusFilterColumn} />
              </SelectTrigger>
              <SelectContent>
                {statusFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* CONTENEDOR DE LA TABLA */}
      <div className="overflow-hidden border border-gray-100 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-slate-900/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold text-xs uppercase tracking-wider">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* --- NUEVOS CONTROLES DE PAGINACIÓN Y SELECCIÓN --- */}
        <div className="flex flex-col gap-4 px-4 py-4 border-t border-gray-100 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} filas seleccionadas.
          </div>
          
          <div className="flex flex-col items-center gap-4 sm:flex-row lg:gap-8">
            {/* Rows per page */}
            <div className="flex items-center gap-2">
              <Label htmlFor="rows-per-page" className="text-sm font-medium whitespace-nowrap">
                Filas por página:
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Page Counter */}
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Páginas {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}