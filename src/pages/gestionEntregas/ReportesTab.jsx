import React, { useState } from "react";
import { Download, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { notify } from "@/components/shared/Notify";

export default function ReportesTab({ docentes, activeDeliverables }) {
  const [pnfFilter, setPnfFilter] = useState("Todos los PNF");
  const [statusFilter, setStatusFilter] = useState("Todos los estados");

  // Get unique PNFs for selector
  const uniquePnfs = ["Todos los PNF", ...new Set(docentes.map(d => d.pnf))];

  // Filters application
  const filteredDocentes = docentes.filter(d => {
    const pnfMatch = pnfFilter === "Todos los PNF" || d.pnf === pnfFilter;
    
    const completed = activeDeliverables.filter(r => d.entregables[r.key]).length;
    const total = activeDeliverables.length;
    
    let statusMatch = true;
    if (statusFilter === "Completos") {
      statusMatch = completed === total;
    } else if (statusFilter === "En progreso") {
      statusMatch = completed > 0 && completed < total;
    } else if (statusFilter === "Sin entregar") {
      statusMatch = completed === 0;
    }
    
    return pnfMatch && statusMatch;
  });

  return (
    <div className="pt-4">
      <Card className="border border-border bg-card">
        <CardHeader className="border-b border-border/80">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Generación de Reportes e Informes Académicos</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Exporta listas detalladas sobre las entregas en PDF, Excel o CSV con filtros avanzados.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const p = new Promise(resolve => setTimeout(resolve, 1500));
                  notify.promise(p, {
                    loading: "Generando PDF institucional...",
                    success: "Reporte PDF descargado con éxito.",
                    error: "Error al generar el archivo."
                  });
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/95 shadow-sm transition-colors cursor-pointer"
              >
                <Download className="size-4" />
                <span>Descargar PDF</span>
              </button>

              <button
                type="button"
                onClick={() => notify.success("Reporte CSV exportado satisfactoriamente.")}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Download className="size-4" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          {/* Filters bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/60">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Filtro por PNF</label>
              <select
                value={pnfFilter}
                onChange={(e) => setPnfFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {uniquePnfs.map(pnf => (
                  <option key={pnf} value={pnf}>{pnf}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Estado de Entrega</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option>Todos los estados</option>
                <option>Completos</option>
                <option>En progreso</option>
                <option>Sin entregar</option>
              </select>
            </div>

            <div className="space-y-1 flex items-end">
              <button
                type="button"
                onClick={() => notify.success("Filtros aplicados a la vista de reportes.")}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold border border-dashed border-border rounded-lg text-primary hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <Filter className="size-3.5" />
                <span>Aplicar Filtros de Reporte</span>
              </button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="font-bold text-xs">Docente</TableHead>
                <TableHead className="font-bold text-xs">PNF</TableHead>
                <TableHead className="font-bold text-xs">Sección</TableHead>
                <TableHead className="font-bold text-xs">Unidad Curricular</TableHead>
                <TableHead className="font-bold text-xs">Progreso</TableHead>
                <TableHead className="font-bold text-xs text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocentes.map((d) => {
                const total = activeDeliverables.length;
                const completed = activeDeliverables.filter(r => d.entregables[r.key]).length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                
                return (
                  <TableRow key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <TableCell className="font-semibold text-xs text-foreground">{d.nombre}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.pnf}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.seccion}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.unidadCurricular}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-xs">{pct}%</span>
                        <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500" : pct === 0 ? "bg-rose-500" : "bg-amber-500"}`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => notify.success(`Reporte individual de ${d.nombre} generado correctamente.`)}
                        className="p-1 px-2.5 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded transition-colors cursor-pointer"
                      >
                        Detalle
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredDocentes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                    No se encontraron registros que coincidan con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
