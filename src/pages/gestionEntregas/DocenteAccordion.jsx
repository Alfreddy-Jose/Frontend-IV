import React, { useState } from "react";
import { Search, BookOpen, Check, AlertCircle, Clock, FolderOpen, Loader2, MessageSquare, X } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ModernTextarea } from "@/components/shared/ModernTextarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useFormik } from "formik";
import { ModernInput } from "@/components/shared/InputModerno";

// ─── Deliverable Card Component (Extracted to manage state and prevent focus loss) ───
const EntregableCard = ({ doc, entregado, observaciones, onToggleEntrega, docenteId, seccionId }) => {
  const [isObsOpen, setIsObsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const formik = useFormik({
    initialValues: { observationText: observaciones || "" },
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!values.observationText.trim()) return;
      setIsSaving(true);
      try {
        await onToggleEntrega(docenteId, doc.id, seccionId, true, values.observationText);
        setIsObsOpen(false);
      } catch (error) {
        console.error("Error saving observation:", error);
      } finally {
        setIsSaving(false);
      }
    }
  });

  const handleOpenObservation = (e) => {
    e.stopPropagation();
    setIsObsOpen(true);
  };

  const handleCloseObservation = (e) => {
    e.stopPropagation();
    setIsObsOpen(false);
    formik.resetForm();
  };

  return (
    <div className="relative">
      <div
        onClick={() => onToggleEntrega(docenteId, doc.id, seccionId, !entregado)}
        className="flex items-center justify-between p-3.5 bg-card border border-border/80 rounded-xl hover:border-slate-300 dark:hover:border-slate-700/80 transition-colors shadow-xs cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className={`size-7 rounded-lg flex items-center justify-center ${entregado ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-slate-100 text-muted-foreground dark:bg-slate-800"}`}>
            {entregado ? (
              <Check className="size-4 stroke-[3px]" />
            ) : (
              <AlertCircle className="size-4" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">{doc.nombre}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {entregado ? "Entregado" : "Pendiente"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Observation icon — only visible when entregado */}
          {entregado && (
            <Popover open={isObsOpen} onOpenChange={setIsObsOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={handleOpenObservation}
                  className="size-7 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition-colors cursor-pointer"
                  title="Agregar observación"
                >
                  <MessageSquare className="size-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-80 p-4 space-y-4 rounded-xl shadow-lg border border-border"
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <form onSubmit={formik.handleSubmit}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <MessageSquare className="size-4 text-blue-500" />
                      Añadir Observación
                    </span>
                    <button
                      type="button"
                      onClick={handleCloseObservation}
                      className="size-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  
                  <ModernTextarea
                    id="observationText"
                    name="observationText"
                    value={formik.values.observationText}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Escribe una observación detallada sobre esta entrega..."
                    disabled={isSaving}
                    autoFocus
                  />
                  
                  <div className="flex items-center justify-end gap-2 pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCloseObservation}
                      disabled={isSaving}
                      className="h-8 text-xs px-3"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="default"
                      size="sm"
                      disabled={!formik.values.observationText.trim() || isSaving}
                      className="h-8 text-xs px-3"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin mr-1.5" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          Guardar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>
          )}

          <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${entregado ? "border-emerald-500 bg-emerald-500" : "border-slate-300 dark:border-slate-600"}`}>
            {entregado && <Check className="size-3 text-white stroke-[3px]" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DocenteAccordion({
  docentes,
  documentos,
  onToggleEntrega,
  loading
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Separate documents by alcance
  const docsInstitucionales = documentos.filter((d) => d.alcance === "docente");
  const docsPorSeccion = documentos.filter((d) => d.alcance === "seccion");

  // ─── Helper: count total and completed deliverables for a docente ───
  const getDocenteProgress = (docente) => {
    let total = 0;
    let completed = 0;

    // Count institutional documents
    docsInstitucionales.forEach((doc) => {
      total++;
      if (docente.entregas_globales && docente.entregas_globales[doc.id]?.entregado) {
        completed++;
      }
    });

    // Count section documents per section
    if (docente.secciones) {
      docente.secciones.forEach((seccion) => {
        docsPorSeccion.forEach((doc) => {
          // Apply business rule: skip "Proyecto" docs for non-project sections
          if (!seccion.es_proyecto && esDocumentoProyecto(doc.nombre)) return;
          total++;
          if (seccion.entregas && seccion.entregas[doc.id]?.entregado) {
            completed++;
          }
        });
      });
    }

    return { total, completed };
  };

  // ─── Helper: Check if a document name refers to a "Proyecto" ───
  const esDocumentoProyecto = (nombre) => {
    if (!nombre) return false;
    const clean = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return clean.includes("proyecto");
  };

  // ─── Helper: Get status badge from progress ───
  const getStatusBadge = (docente) => {
    const { total, completed } = getDocenteProgress(docente);

    if (total === 0) return <Badge variant="outline">Sin requisitos</Badge>;

    if (completed === total) {
      return (
        <span className="inline-flex flex-col items-start gap-1">
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">
            Completo
          </Badge>
          <span className="text-[10px] text-muted-foreground font-medium">Todos entregados</span>
        </span>
      );
    } else if (completed === 0) {
      return (
        <span className="inline-flex flex-col items-start gap-1">
          <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400">
            Sin Entregar
          </Badge>
          <span className="text-[10px] text-muted-foreground font-medium">0 de {total} completados</span>
        </span>
      );
    } else {
      const percentage = (completed / total) * 100;
      return (
        <div className="flex flex-col gap-1.5 min-w-[100px]">
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 w-fit">
            En Progreso
          </Badge>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">{completed}/{total}</span>
          </div>
        </div>
      );
    }
  };

  // ─── Filtered teachers list based on search term ───
  const filteredDocentes = docentes.filter((docente) => {
    const term = searchTerm.toLowerCase();
    const matchName = docente.nombre_completo?.toLowerCase().includes(term);
    const matchPnf = docente.pnf?.toLowerCase().includes(term);
    const matchSeccion = docente.secciones?.some(
      (s) => String(s.seccion_nombre || "").toLowerCase().includes(term) || String(s.uc_nombre || "").toLowerCase().includes(term)
    );
    return matchName || matchPnf || matchSeccion;
  });

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Cargando datos del dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Carga Académica por Docente</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visualiza y actualiza la recepción de los documentos requeridos por docente y unidad curricular.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-56 md:w-64">
            <ModernInput
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o apellido..."
            />
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filteredDocentes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FolderOpen className="size-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No se encontraron docentes</p>
          <p className="text-xs mt-1">Intenta con otro término de búsqueda.</p>
        </div>
      )}

      {/* Accordion Component */}
      <Accordion type="single" collapsible className="w-full space-y-3">
        {filteredDocentes.map((docente) => (
          <AccordionItem
            key={docente.docente_id}
            value={docente.docente_id.toString()}
            className="border border-border rounded-xl bg-card hover:bg-accent/5 dark:bg-slate-900/30 dark:border-slate-800/80 transition-all duration-200 shadow-xs"
          >
            <AccordionTrigger className="w-full py-4 px-5 hover:no-underline [&_svg]:transition-transform [&_svg]:duration-200 rounded-xl">
              <div className="flex items-center justify-between w-full pr-4 text-left">
                <div className="flex items-center gap-3">
                  {/* Circle initials badge */}
                  <div className="size-9 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground/90 flex items-center justify-center font-bold text-xs">
                    {docente.nombre_completo
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-sm leading-none">{docente.nombre_completo}</span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {docente.secciones?.length || 0} secciones asignadas
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Computed Status Badge */}
                  {getStatusBadge(docente)}
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-5 pb-5 pt-2 border-t border-border bg-slate-50/50 dark:bg-slate-900/10 rounded-b-xl">
              <div className="space-y-6">

                {/* ═══════════════════════════════════════════ */}
                {/* A. Bloque Institucional (alcance: docente)  */}
                {/* ═══════════════════════════════════════════ */}
                {docsInstitucionales.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                      <BookOpen className="size-3.5 text-primary" />
                      <span>Documentos del Docente (Institucional)</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {docsInstitucionales.map((doc) => {
                        const entregaData = docente.entregas_globales?.[doc.id];
                        const entregado = entregaData?.entregado || false;
                        const observaciones = entregaData?.observaciones || "";
                        
                        return (
                          <EntregableCard
                            key={`global-${doc.id}`}
                            doc={doc}
                            entregado={entregado}
                            observaciones={observaciones}
                            docenteId={docente.docente_id}
                            seccionId={null}
                            onToggleEntrega={onToggleEntrega}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* B. Bloque por Secciones (alcance: seccion)  */}
                {/* ═══════════════════════════════════════════ */}
                {docente.secciones?.map((seccion, index) => (
                  <div key={`${seccion.seccion_id}-${index}`} className="space-y-3">
                    {/* Section header */}
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                        Detalle de Sección: {seccion.seccion_nombre} - {seccion.uc_nombre}
                      </h4>
                      {seccion.es_proyecto && (
                        <Badge className="bg-violet-500/10 text-violet-600 border border-violet-500/20 dark:bg-violet-500/20 dark:text-violet-400 text-[10px] font-semibold px-1.5 py-0">
                          Proyecto
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {docsPorSeccion
                        .filter((doc) => {
                          // Business rule: if UC is NOT proyecto and document name contains "Proyecto", skip it
                          if (!seccion.es_proyecto && esDocumentoProyecto(doc.nombre)) {
                            return false;
                          }
                          return true;
                        })
                        .map((doc) => {
                          const entregaData = seccion.entregas?.[doc.id];
                          const entregado = entregaData?.entregado || false;
                          const observaciones = entregaData?.observaciones || "";
                          
                          return (
                            <EntregableCard
                              key={`sec-${seccion.seccion_id}-${index}-${doc.id}`}
                              doc={doc}
                              entregado={entregado}
                              observaciones={observaciones}
                              docenteId={docente.docente_id}
                              seccionId={seccion.seccion_id}
                              onToggleEntrega={onToggleEntrega}
                            />
                          );
                        })}
                    </div>
                  </div>
                ))}

                {/* Extra details info bar */}
                <div className="p-3 bg-slate-100/50 dark:bg-slate-800/30 rounded-lg flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-primary" />
                    <span>Último cambio por: <b className="text-foreground">Admin</b></span>
                  </div>
                  <span>Fecha límite de Planificación: <b className="text-foreground">2026-06-15</b></span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
