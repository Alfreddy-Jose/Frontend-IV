import React, { useState, useMemo, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SplitSectionModal } from "./SplitSectionModal";
import { MergeSectionModal } from "./MergeSectionModal";
import {
    Split,
    Merge,
    CheckCircle2,
    Users,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react";
import { notify } from "@/components/shared/Notify";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getEstado(matricula) {
    if (matricula > 45) return "sobrecargada";
    if (matricula < 15) return "baja";
    return "optima";
}

function EstadoBadge({ matricula }) {
    const estado = getEstado(matricula);

    const map = {
        sobrecargada: {
            label: "Sobrecargada",
            className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800",
        },
        baja: {
            label: "Baja Matrícula",
            className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        },
        optima: {
            label: "Óptima",
            className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        },
    };

    const { label, className } = map[estado];
    return (
        <Badge variant="outline" className={`font-semibold ${className}`}>
            {label}
        </Badge>
    );
}

function RowIcon({ matricula }) {
    const estado = getEstado(matricula);
    if (estado === "sobrecargada") return <Users className="w-4 h-4 text-red-500 inline mr-1" />;
    if (estado === "baja") return <Merge className="w-4 h-4 text-amber-500 inline mr-1" />;
    return <CheckCircle2 className="w-4 h-4 text-emerald-500 inline mr-1" />;
}

// ─── Componente Principal ────────────────────────────────────────────────────

export function TablaAnalisisSecciones({ secciones = [], onRefresh, onDividir, onFusionar }) {
    const [seccionParaDividir, setSeccionParaDividir] = useState(null);
    const [seccionParaFusionar, setSeccionParaFusionar] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState("todas");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const seccionesFiltradas = useMemo(() => {
        if (filtroEstado === "todas") return secciones;
        return secciones.filter(sec => getEstado(sec.matricula) === filtroEstado);
    }, [secciones, filtroEstado]);

    const pageCount = Math.ceil(seccionesFiltradas.length / pageSize) || 1;
    const canPreviousPage = pageIndex > 0;
    const canNextPage = pageIndex < pageCount - 1;

    useEffect(() => {
        if (pageIndex >= pageCount) {
            setPageIndex(Math.max(0, pageCount - 1));
        }
    }, [pageCount, pageIndex]);

    const currentData = useMemo(() => {
        const start = pageIndex * pageSize;
        const end = start + pageSize;
        return seccionesFiltradas.slice(start, end);
    }, [seccionesFiltradas, pageIndex, pageSize]);

    const opcionesFusion = useMemo(() => {
        if (!seccionParaFusionar) return [];
        return secciones.filter(s =>
            s.id !== seccionParaFusionar.id &&
            (s.unidad_curricular_id === seccionParaFusionar.unidad_curricular_id) &&
            (s.sede === seccionParaFusionar.sede)
        );
    }, [secciones, seccionParaFusionar]);

    const opcionesTransferencia = useMemo(() => {
        if (!seccionParaDividir) return [];
        return secciones.filter(s =>
            s.id !== seccionParaDividir.id &&
            (s.unidad_curricular_id === seccionParaDividir.unidad_curricular_id) &&
            (s.sede === seccionParaDividir.sede)
        );
    }, [secciones, seccionParaDividir]);

    // Las operaciones de dividir y fusionar se delegan al componente padre
    // que hace un fetch fresco desde el backend después de cada mutación.

    if (!secciones.length) {
        return (
            <div className="mt-8 text-center py-16 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm">
                <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Carga un archivo para ver el análisis de secciones.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            {/* Encabezado de la tabla */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Análisis de Secciones
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {seccionesFiltradas.length} secciones mostradas
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={filtroEstado === "todas" ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setFiltroEstado("todas"); setPageIndex(0); }}
                        className="h-7 text-xs px-2"
                    >
                        Todas
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setFiltroEstado("optima"); setPageIndex(0); }}
                        className={`h-7 text-xs px-2 gap-1.5 ${filtroEstado === "optima" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800" : ""}`}
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        Óptimas
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setFiltroEstado("baja"); setPageIndex(0); }}
                        className={`h-7 text-xs px-2 gap-1.5 ${filtroEstado === "baja" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800" : ""}`}
                    >
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                        Baja Matrícula
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setFiltroEstado("sobrecargada"); setPageIndex(0); }}
                        className={`h-7 text-xs px-2 gap-1.5 ${filtroEstado === "sobrecargada" ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800" : ""}`}
                    >
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                        Sobrecargadas
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50 dark:bg-slate-900/50">
                        <TableRow className="border-b border-gray-100 dark:border-slate-800">
                            <TableHead className="px-4">Sección</TableHead>
                            <TableHead>Sede</TableHead>
                            <TableHead>Unidad curricular</TableHead>
                            <TableHead>Trayecto</TableHead>
                            <TableHead>Matrícula</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-center px-4 w-[180px]">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.map((sec) => {
                            const estado = getEstado(sec.matricula);
                            const rowBg =
                                estado === "sobrecargada"
                                    ? "bg-red-50/40 dark:bg-red-950/10"
                                    : estado === "baja"
                                        ? "bg-amber-50/40 dark:bg-amber-950/10"
                                        : "";

                            return (
                                <TableRow
                                    key={sec.id}
                                    className={`border-b border-gray-100 dark:border-slate-800 transition-colors ${rowBg}`}
                                >
                                    <TableCell className="px-4 font-medium text-slate-900 dark:text-slate-100">
                                        <RowIcon matricula={sec.matricula} />
                                        {sec.codigo ?? sec.nombre ?? `#${sec.id}`}
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">
                                        {sec.sede ?? "—"}
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">
                                        {sec.unidad_curricular ?? "—"}
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">
                                        {sec.trayecto ?? "—"}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`font-bold text-base ${estado === "sobrecargada"
                                                ? "text-red-600 dark:text-red-400"
                                                : estado === "baja"
                                                    ? "text-amber-600 dark:text-amber-400"
                                                    : "text-emerald-600 dark:text-emerald-400"
                                                }`}
                                        >
                                            {sec.matricula}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <EstadoBadge matricula={sec.matricula} />
                                    </TableCell>
                                    <TableCell className="text-center px-4">
                                        {estado === "sobrecargada" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/30"
                                                onClick={() => setSeccionParaDividir(sec)}
                                            >
                                                <Split className="w-3.5 h-3.5" />
                                                Dividir Sección
                                            </Button>
                                        )}
                                        {estado === "baja" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/30"
                                                onClick={() => setSeccionParaFusionar(sec)}
                                            >
                                                <Merge className="w-3.5 h-3.5" />
                                                Fusionar Sección
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* --- CONTROLES DE PAGINACIÓN --- */}
            <div className="flex flex-col gap-4 px-4 py-4 border-t border-gray-100 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 text-sm text-muted-foreground">
                </div>

                <div className="flex flex-col items-center gap-4 sm:flex-row lg:gap-8">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="rows-per-page" className="text-sm font-medium whitespace-nowrap">
                            Filas por página:
                        </Label>
                        <Select
                            value={`${pageSize}`}
                            onValueChange={(value) => {
                                setPageSize(Number(value));
                                setPageIndex(0);
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]" id="rows-per-page">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Páginas {pageIndex + 1} de {pageCount}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => setPageIndex(0)}
                            disabled={!canPreviousPage}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setPageIndex((prev) => prev - 1)}
                            disabled={!canPreviousPage}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setPageIndex((prev) => prev + 1)}
                            disabled={!canNextPage}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => setPageIndex(pageCount - 1)}
                            disabled={!canNextPage}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal de División / Transferencia */}
            <SplitSectionModal
                isOpen={!!seccionParaDividir}
                onClose={() => setSeccionParaDividir(null)}
                seccion={seccionParaDividir}
                opcionesTransferencia={opcionesTransferencia}
                onConfirm={async (payload) => {
                    await onDividir?.(payload);
                    setSeccionParaDividir(null);
                }}
            />

            {/* Modal de Fusión */}
            <MergeSectionModal
                isOpen={!!seccionParaFusionar}
                onClose={() => setSeccionParaFusionar(null)}
                seccionOrigen={seccionParaFusionar}
                opciones={opcionesFusion}
                onConfirm={async (payload) => {
                    await onFusionar?.(payload);
                    setSeccionParaFusionar(null);
                }}
            />
        </div>
    );
}
