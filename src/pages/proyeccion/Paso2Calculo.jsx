import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { notify } from "@/components/shared/Notify";
import { obtenerDatosPaso2, guardarPaso2 } from "@/services/proyeccionService";
import ProyeccionDataSkeleton from "./ProyeccionDataSkeleton";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Sparkles,
  CheckCircle2,
  XCircle,
  Layers,
  Info,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Paso2Calculo({
  onBack,
  onNext,
  selection = {},
  anoProyectado,
  anoOrigenHistorico
}) {
  const proyeccionId = selection?.proyeccion_id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [metrics, setMetrics] = useState({
    total_grupos_aprobados: 0,
    total_grupos_reprobados: 0,
    total_estudiantes_aprobados: 0,
    total_estudiantes_reprobados: 0,
    total_secciones_activas: 0,
  });
  const [detalles, setDetalles] = useState([]);
  const [filaExpandida, setFilaExpandida] = useState(null);
  const [datosDeApi, setDatosDeApi] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch Step 2 data
  useEffect(() => {
    if (!proyeccionId) {
      setLoading(false);
      return;
    }

    const loadStep2Data = async () => {
      try {
        setLoading(true);
        const res = await obtenerDatosPaso2(proyeccionId);

        // Extract dynamically matching API response structure
        const rawData = res?.resumen_métricas !== undefined ? res : (res?.data || {});

        setMetrics(rawData.resumen_métricas || {
          total_grupos_aprobados: 0,
          total_grupos_reprobados: 0,
          total_estudiantes_aprobados: 0,
          total_estudiantes_reprobados: 0,
          total_secciones_activas: 0,
        });

        setDatosDeApi(rawData);
      } catch (error) {
        console.error(error);
        notify.error("Error al cargar los resultados de la simulación del Paso 2.");
      } finally {
        setLoading(false);
      }
    };

    loadStep2Data();
  }, [proyeccionId]);

  useEffect(() => {
    if (datosDeApi && datosDeApi.detalles && datosDeApi.detalles.length > 0) {
      const detallesProcesados = datosDeApi.detalles.map(fila => {
        let destinoSugerido = fila.seccion_destino;

        // Solo alteramos si la API mandó el origen igual al destino (estado inicial)
        if (fila.seccion_origen === fila.seccion_destino) {
          const trayectoSiguiente = String(Number(fila.trayecto_origen_nombre) + 1);
          const correlativo = fila.seccion_origen.slice(-2); // Extraemos los últimos 2 números (ej: "01", "03")

          // Buscamos cualquier sección del trayecto N+1 en esta MISMA sede para aprender su prefijo
          const seccionReferencia = datosDeApi.detalles.find(d =>
            d.sede_id === fila.sede_id &&
            String(d.trayecto_origen_nombre) === trayectoSiguiente
          );

          if (seccionReferencia) {
            // Aprendemos el prefijo (todo el nombre excepto los últimos 2 números)
            const prefijo = seccionReferencia.seccion_origen.slice(0, -2);
            // Construimos el nuevo destino
            destinoSugerido = `${prefijo}${correlativo}`;
          }
        }
        return { ...fila, seccion_destino: destinoSugerido };
      });

      setDetalles(detallesProcesados);
    }
  }, [datosDeApi]);

  // Accordion Toggle
  const toggleRow = (rowId) => {
    setFilaExpandida((prev) => (prev === rowId ? null : rowId));
  };

  // Input changes handlers
  const handleSeccionDestinoChange = (id, value) => {
    setDetalles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, seccion_destino: value } : item))
    );
  };

  const handleCrearSeccionToggle = (filaActual, nuevoValor) => {
    setDetalles((prevDetalles) =>
      prevDetalles.map((d) => {
        if (
          d.id === filaActual.id ||
          (d.seccion_destino === filaActual.seccion_destino && d.sede_id === filaActual.sede_id)
        ) {
          return { ...d, crear_seccion: nuevoValor };
        }
        return d;
      })
    );
  };

  const handleReincorporadosToggle = (filaActual, checked) => {
    setDetalles((prevDetalles) =>
      prevDetalles.map((d) => {
        if (
          d.id === filaActual.id ||
          (d.seccion_destino === filaActual.seccion_destino && d.sede_id === filaActual.sede_id)
        ) {
          return { ...d, tiene_reincorporados: !!checked };
        }
        return d;
      })
    );
  };

  const handleSaveAndContinue = async () => {
    // Validate destinatary section name when creating section is true
    const invalidSections = detalles.filter((item) => item.crear_seccion && !item.seccion_destino?.trim());
    if (invalidSections.length > 0) {
      notify.error("Por favor, asigne una Sección Destino a todas las secciones marcadas para crear.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        proyeccion_id: Number(proyeccionId),
        detalles: detalles.map((item) => ({
          id: item.id,
          seccion_destino: item.seccion_destino,
          crear_seccion: item.crear_seccion,
          tiene_reincorporados: item.tiene_reincorporados,
        })),
      };

      await guardarPaso2(payload);
      notify.success("¡Paso 2 guardado con éxito!");
      if (onNext) {
        onNext(detalles);
      }
    } catch (error) {
      console.error(error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al guardar las decisiones del Paso 2.";
      notify.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ProyeccionDataSkeleton />;
  }

  if (!proyeccionId) {
    return (
      <div className="rounded-2xl border border-dashed border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/10 p-12 text-center flex flex-col items-center justify-center space-y-4">
        <div className="p-3.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h4 className="text-base font-bold text-red-800 dark:text-red-200">
            Falta ID de Proyección
          </h4>
          <p className="text-xs text-red-500 dark:text-red-400 leading-relaxed">
            No se ha encontrado una sesión de proyección activa. Por favor, vuelva al Paso 1 y guarde la plantilla inicial antes de continuar.
          </p>
        </div>
        <Button onClick={onBack} variant="outline" className="mt-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Paso 1
        </Button>
      </div>
    );
  }

  const detallesOrdenados = [...detalles].sort((a, b) => {
    // 1. Priorizar Trayecto
    const tA = String(a.trayecto_origen_nombre).toUpperCase() === "PIU" ? 0 : Number(a.trayecto_origen_nombre || 0);
    const tB = String(b.trayecto_origen_nombre).toUpperCase() === "PIU" ? 0 : Number(b.trayecto_origen_nombre || 0);

    if (tA !== tB) {
      return tA - tB;
    }

    // 2. Luego por Sede
    if (a.sede_id !== b.sede_id) {
      return a.sede_id - b.sede_id;
    }

    // 3. Finalmente por sección
    return (a.seccion_origen || "").localeCompare(b.seccion_origen || "");
  });

  const pageCount = Math.ceil(detallesOrdenados.length / pageSize);
  const currentData = detallesOrdenados.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <div className="space-y-6">
      {/* ── TARJETAS MÉTRICAS SUPERIORES ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Aprobados */}
        <Card className="relative overflow-hidden rounded-2xl border border-emerald-100 dark:border-emerald-950/40 bg-gradient-to-br from-emerald-50/40 to-teal-50/20 dark:from-emerald-950/15 dark:to-teal-950/5 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-emerald-700/80 dark:text-emerald-400/80 tracking-wider uppercase">
                Aprobados Proyectados
              </p>
              <p className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                {metrics.total_grupos_aprobados} Grupos
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                ({metrics.total_estudiantes_aprobados} Estudiantes aprox.)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card Reprobados */}
        <Card className="relative overflow-hidden rounded-2xl border border-rose-100 dark:border-rose-950/40 bg-gradient-to-br from-rose-50/40 to-orange-50/20 dark:from-rose-950/15 dark:to-orange-950/5 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-rose-700/80 dark:text-rose-400/80 tracking-wider uppercase">
                Reprobados Proyectados
              </p>
              <p className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                {metrics.total_grupos_reprobados} Grupos
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                ({metrics.total_estudiantes_reprobados} Estudiantes aprox.)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card Secciones Proyectadas */}
        <Card className="relative overflow-hidden rounded-2xl border border-indigo-100 dark:border-indigo-950/40 bg-gradient-to-br from-indigo-50/40 to-purple-50/20 dark:from-indigo-950/15 dark:to-purple-950/5 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-indigo-700/80 dark:text-indigo-400/80 tracking-wider uppercase">
                Secciones Activas
              </p>
              <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {metrics.total_secciones_activas} Secciones
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                Según simulación en cascada
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── TABLA DE ACCIONES Y DECISIONES ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Decisiones sobre Secciones Proyectadas
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Proyección para el lapso: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{anoProyectado || "No especificado"}</span>
              </p>
            </div>
          </div>
        </div>

        {detalles.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Info className="w-10 h-10 text-slate-400" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No se han encontrado datos simulados para esta proyección.
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              Por favor, asegúrese de haber configurado adecuadamente el Paso 1 de la proyección.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                  <TableHead className="w-12 text-center"></TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Sede / Trayecto</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Sección Origen</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-48">Sección Destino</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">Proyección Aprobados</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">Proyección Reprobados</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center w-36">¿Crear Sección?</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center w-36">¿Reincorporados?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((fila) => {
                  const destinoActual = fila.seccion_destino || "";
                  const anoAnterior = 2026;

                  // Detección de fusión: ¿hay más de una fila con el mismo destino en esta sede?
                  const esFusionada = detalles.filter(d =>
                    d.seccion_destino === destinoActual &&
                    d.sede_id === fila.sede_id
                  ).length > 1;

                  // 1. LOS QUE VIENEN (Lee estrictamente de ESTA fila)
                  const trayectoViene = fila.trayecto_origen_nombre === "0" ? "PIU" : fila.trayecto_origen_nombre;
                  const totalVienen = Number(fila.estudiantes_aprobados_estimados || 0);

                  // 2. LOS QUE SE QUEDAN (Busca en el estado global 'detalles' la sección histórica IGUAL al destinoActual)
                  const filaHistorica = detalles.find(d => d.seccion_origen === destinoActual && d.sede_id === fila.sede_id);
                  const totalSeQuedan = filaHistorica ? Number(filaHistorica.estudiantes_reprobados_estimados || 0) : 0;
                  const trayectoSeQueda = filaHistorica ? (filaHistorica.trayecto_origen_nombre === "0" ? "PIU" : filaHistorica.trayecto_origen_nombre) : "N/A";

                  // 3. MATEMÁTICA DE TOTALES (Para la regla de los 40, soportando fusiones)
                  const totalIngresosGlobal = detalles
                    .filter(d => d.seccion_destino === destinoActual && d.sede_id === fila.sede_id)
                    .reduce((sum, d) => sum + Number(d.estudiantes_aprobados_estimados || 0), 0);

                  const totalEstimado = totalIngresosGlobal + totalSeQuedan;
                  const excedeLimite = totalEstimado > 40;

                  return (
                    <React.Fragment key={fila.id}>
                      <TableRow className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20">
                        {/* Botón Acordeón en la primera columna */}
                        <TableCell className="w-12 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleRow(fila.id)}
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full transition-all duration-200 cursor-pointer"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${filaExpandida === fila.id ? "transform rotate-180" : ""
                                }`}
                            />
                          </Button>
                        </TableCell>

                        {/* Sede y Trayecto Origen */}
                        <TableCell className="font-medium text-slate-800 dark:text-slate-300">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-slate-850 dark:text-slate-205">
                              {fila.sede_nombre}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {fila.trayecto_origen_nombre}
                            </span>
                          </div>
                        </TableCell>

                        {/* Sección Origen */}
                        <TableCell className="text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                          {fila.seccion_origen}
                        </TableCell>

                        {/* Entrada Editable Sección Destino */}
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Input
                              type="text"
                              value={fila.seccion_destino}
                              disabled={!fila.crear_seccion}
                              placeholder={fila.crear_seccion ? "Ejemplo: INF-3-1" : "Excluido del plan"}
                              onChange={(e) => handleSeccionDestinoChange(fila.id, e.target.value)}
                              className={`h-9 font-semibold text-xs text-center border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 ${fila.crear_seccion && !fila.seccion_destino?.trim()
                                ? "border-amber-400 dark:border-amber-500 focus-visible:ring-amber-400"
                                : ""
                                }`}
                            />
                            {esFusionada && (
                              <span className="text-xs bg-blue-900/50 text-blue-300 border border-blue-700 px-2 py-0.5 rounded-full w-fit flex items-center gap-1 font-semibold">
                                🔗 Fusionada
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Métricas Aprobados (Muestra tanto equipos como estudiantes aprox) */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <Badge className="bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border-none px-2 rounded-full text-[10px] whitespace-nowrap">
                              {fila.grupos_aprobados} Equipos
                            </Badge>
                            <span className="text-[10px] text-slate-400 mt-1 whitespace-nowrap">
                              ~{fila.estudiantes_aprobados_estimados} Estudiantes
                            </span>
                          </div>
                        </TableCell>

                        {/* Métricas Reprobados (Muestra tanto equipos como estudiantes aprox) */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <Badge className="bg-rose-500/10 hover:bg-rose-500/15 text-rose-600 dark:text-rose-450 font-bold border-none px-2 rounded-full text-[10px] whitespace-nowrap">
                              {fila.grupos_reprobados} Equipos
                            </Badge>
                            <span className="text-[10px] text-slate-400 mt-1 whitespace-nowrap">
                              ~{fila.estudiantes_reprobados_estimados} Estudiantes
                            </span>
                          </div>
                        </TableCell>

                        {/* Switch: Crear Sección */}
                        <TableCell className="text-center">
                          <div className="flex h-9 items-center justify-center">
                            <Switch
                              checked={!!fila.crear_seccion}
                              onCheckedChange={(checked) => handleCrearSeccionToggle(fila, checked)}
                            />
                          </div>
                        </TableCell>

                        {/* Checkbox: Tiene Reincorporados */}
                        <TableCell className="text-center">
                          <div className="flex h-9 items-center justify-center">
                            <Checkbox
                              checked={!!fila.tiene_reincorporados}
                              onCheckedChange={(checked) => handleReincorporadosToggle(fila, !!checked)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* ACORDEÓN EXPANDIDO */}
                      {filaExpandida === fila.id && (
                        <TableRow className="bg-slate-50/40 dark:bg-slate-950/20 border-t-0 hover:bg-slate-50/40 dark:hover:bg-slate-950/20 select-text">
                          <TableCell colSpan={8} className="p-0">
                            <div className="mx-4 mb-4 mt-2 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col gap-4 shadow-inner">
                              <div className="flex gap-4">
                                <div className="flex-1 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 shadow-sm">
                                  🟢 Vienen del año {anoAnterior}, trayecto {trayectoViene}, sección {fila.seccion_origen}: <span className="font-bold text-slate-900 dark:text-slate-100">{totalVienen}</span> estudiantes.
                                </div>
                                <div className="flex-1 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 shadow-sm">
                                  🔴 Se quedan del año {anoAnterior}, trayecto {trayectoSeQueda}, sección {destinoActual}: <span className="font-bold text-slate-900 dark:text-slate-100">{totalSeQuedan}</span> estudiantes.
                                </div>
                              </div>
                              <div className={`p-3 rounded-lg text-center font-bold shadow-sm ${excedeLimite ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'}`}>
                                Total Estimado en Sección Destino ({destinoActual}): {totalEstimado} estudiantes
                                {excedeLimite && " (⚠️ Excede límite de 40)"}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* --- CONTROLES DE PAGINACIÓN --- */}
        {detalles.length > 0 && (
          <div className="flex flex-col gap-4 px-4 py-4 border-t border-slate-100 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-[#0f172a] rounded-b-2xl">
            <div className="flex-1 text-sm text-slate-500 font-medium">
              Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, detallesOrdenados.length)} de {detallesOrdenados.length} filas.
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row lg:gap-8">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-300">
                  Filas por página:
                </span>
                <Select
                  value={`${pageSize}`}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(0);
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
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

              <div className="flex w-[100px] items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-300">
                Página {pageCount > 0 ? currentPage + 1 : 0} de {pageCount || 1}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                >
                  <span className="sr-only">Ir a la primera página</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                >
                  <span className="sr-only">Ir a la página anterior</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount - 1))}
                  disabled={currentPage >= pageCount - 1 || pageCount === 0}
                >
                  <span className="sr-only">Ir a la página siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => setCurrentPage(pageCount - 1)}
                  disabled={currentPage >= pageCount - 1 || pageCount === 0}
                >
                  <span className="sr-only">Ir a la última página</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── NAVEGACIÓN Y BOTONES DE ACCIÓN ── */}
      <div className="flex justify-between items-center p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={submitting}
          className="px-5 py-2 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Paso 1
        </Button>

        {detalles.length > 0 && (
          <Button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={submitting}
            className="px-5 py-2 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
          >
            {submitting ? "Cargando..." : "Continuar al Paso 3"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
