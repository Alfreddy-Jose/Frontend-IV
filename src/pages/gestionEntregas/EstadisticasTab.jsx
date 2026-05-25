import React from "react";
import { Users, FileText, TrendingUp, AlertCircle, CheckCircle2, Clock, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadialBarChart, RadialBar } from "recharts";

export default function EstadisticasTab({ docentes, activeDeliverables }) {

  // ─── Helper: Check if a document name refers to a "Proyecto" ───
  const esDocumentoProyecto = (nombre) => {
    if (!nombre) return false;
    const clean = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return clean.includes("proyecto");
  };

  // Separate documents by alcance
  const docsInstitucionales = activeDeliverables.filter((d) => d.alcance === "docente");
  const docsPorSeccion = activeDeliverables.filter((d) => d.alcance === "seccion");

  // ─── Compute real progress per docente ───
  const getDocenteProgress = (docente) => {
    let total = 0;
    let completed = 0;

    docsInstitucionales.forEach((doc) => {
      total++;
      if (docente.entregas_globales && docente.entregas_globales[doc.id]?.entregado) {
        completed++;
      }
    });

    if (docente.secciones) {
      docente.secciones.forEach((seccion) => {
        docsPorSeccion.forEach((doc) => {
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

  // ─── KPI Calculations ───
  const totalDocentes = docentes.length;

  let totalEntregables = 0;
  let totalEntregados = 0;
  let completedDocentes = 0;
  let pendingDocentes = 0;
  let inProgressDocentes = 0;

  docentes.forEach((docente) => {
    const { total, completed } = getDocenteProgress(docente);
    totalEntregables += total;
    totalEntregados += completed;
    if (total > 0 && completed === total) completedDocentes++;
    else if (completed === 0) pendingDocentes++;
    else inProgressDocentes++;
  });

  const deliveryRate = totalEntregables > 0 ? Math.round((totalEntregados / totalEntregables) * 100) : 0;

  // ─── Pie Chart: Overall status distribution ───
  const getOverallStats = () => {
    return [
      { name: "Completo", value: completedDocentes, color: "#10b981" },
      { name: "En Progreso", value: inProgressDocentes, color: "#f59e0b" },
      { name: "Sin Entregar", value: pendingDocentes, color: "#ef4444" }
    ].filter((s) => s.value > 0);
  };

  // ─── Bar Chart: Delivery percentage grouped by document type ───
  const getDocumentChartData = () => {
    return activeDeliverables.map((doc) => {
      let total = 0;
      let completed = 0;

      if (doc.alcance === "docente") {
        docentes.forEach((docente) => {
          total++;
          if (docente.entregas_globales && docente.entregas_globales[doc.id]?.entregado) {
            completed++;
          }
        });
      } else {
        docentes.forEach((docente) => {
          if (docente.secciones) {
            docente.secciones.forEach((seccion) => {
              if (!seccion.es_proyecto && esDocumentoProyecto(doc.nombre)) return;
              total++;
              if (seccion.entregas && seccion.entregas[doc.id]?.entregado) {
                completed++;
              }
            });
          }
        });
      }

      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        name: doc.nombre.length > 18 ? doc.nombre.substring(0, 18) + "…" : doc.nombre,
        fullName: doc.nombre,
        Entregado: pct,
        Pendiente: 100 - pct,
        completed,
        total
      };
    });
  };

  // ─── Ranking: Top docentes by completion ───
  const getDocenteRanking = () => {
    return docentes
      .map((d) => {
        const { total, completed } = getDocenteProgress(d);
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { ...d, total, completed, pct };
      })
      .sort((a, b) => b.pct - a.pct || b.completed - a.completed)
      .slice(0, 6);
  };

  // ─── Custom Recharts Tooltip ───
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border shadow-lg rounded-lg px-3 py-2 text-xs">
          <p className="font-bold text-foreground mb-1">{payload[0]?.payload?.fullName || label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-muted-foreground">
              <span className="inline-block size-2 rounded-full mr-1.5" style={{ backgroundColor: p.fill || p.color }}></span>
              {p.name}: <span className="font-semibold text-foreground">{p.value}%</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // ─── Radial progress for delivery rate ───
  const radialData = [
    { name: "Tasa", value: deliveryRate, fill: deliveryRate >= 75 ? "#10b981" : deliveryRate >= 40 ? "#f59e0b" : "#ef4444" }
  ];

  return (
    <div className="pt-4 space-y-6">
      {/* ═══ KPI STAT CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Total Docentes</span>
              <h3 className="text-2xl font-extrabold text-foreground">{totalDocentes}</h3>
              <span className="text-[10px] text-muted-foreground">Registrados en el lapso</span>
            </div>
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Documentos Activos</span>
              <h3 className="text-2xl font-extrabold text-foreground">{activeDeliverables.length}</h3>
              <span className="text-[10px] text-muted-foreground">
                {docsInstitucionales.length} institucional · {docsPorSeccion.length} por sección
              </span>
            </div>
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FileText className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Docentes Completos</span>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedDocentes}</h3>
              <span className="text-[10px] text-muted-foreground">100% de sus documentos</span>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border/80 shadow-xs hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Pendientes / En Progreso</span>
              <h3 className="text-2xl font-extrabold text-amber-500">{pendingDocentes + inProgressDocentes}</h3>
              <span className="text-[10px] text-muted-foreground">
                {pendingDocentes} sin entregar · {inProgressDocentes} parcial
              </span>
            </div>
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertCircle className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ CHARTS ROW ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart: Distribución de estados */}
        <Card className="lg:col-span-1 border border-border bg-card hover:shadow-md transition-shadow duration-300">
          <CardHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <PieChartIcon className="size-4 text-primary" />
              <CardTitle className="text-sm font-bold text-foreground">Distribución de Estados</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Clasificación de docentes según su nivel de cumplimiento.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center h-[280px]">
            {getOverallStats().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getOverallStats()}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
                  >
                    {getOverallStats().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0];
                        return (
                          <div className="bg-card border border-border shadow-lg rounded-lg px-3 py-2 text-xs">
                            <p className="font-bold text-foreground">
                              <span className="inline-block size-2 rounded-full mr-1.5" style={{ backgroundColor: d.payload.color }}></span>
                              {d.name}: <span>{d.value} docente(s)</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <PieChartIcon className="size-8 opacity-30" />
                <span className="text-xs">Sin datos disponibles</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart: Porcentaje de entrega por documento */}
        <Card className="lg:col-span-2 border border-border bg-card hover:shadow-md transition-shadow duration-300">
          <CardHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              <CardTitle className="text-sm font-bold text-foreground">Porcentaje de Entrega por Documento</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Nivel de cumplimiento para cada tipo de documento requerido.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[280px]">
            {getDocumentChartData().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getDocumentChartData()} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" domain={[0, 100]} unit="%" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="Entregado" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={18} />
                  <Bar dataKey="Pendiente" stackId="a" fill="#f1f5f9" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <BarChart3 className="size-8 opacity-30" />
                <span className="text-xs">Sin documentos configurados</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══ BOTTOM ROW: Radial + Ranking ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radial Gauge: Tasa de consignación */}
        <Card className="lg:col-span-1 border border-border bg-card hover:shadow-md transition-shadow duration-300">
          <CardHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <CardTitle className="text-sm font-bold text-foreground">Tasa de Consignación</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Porcentaje global de documentos entregados sobre el total requerido.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center h-[240px]">
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  barSize={14}
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    background={{ fill: "hsl(var(--muted))" }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-extrabold ${deliveryRate >= 75 ? "text-emerald-600 dark:text-emerald-400" : deliveryRate >= 40 ? "text-amber-500" : "text-rose-500"}`}>
                  {deliveryRate}%
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {totalEntregados}/{totalEntregables}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ranking Table: Top docentes */}
        <Card className="lg:col-span-2 border border-border bg-card hover:shadow-md transition-shadow duration-300">
          <CardHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <CardTitle className="text-sm font-bold text-foreground">Ranking de Docentes</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Los docentes con mayor y menor nivel de cumplimiento en el lapso actual.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {getDocenteRanking().length > 0 ? (
              <div className="divide-y divide-border">
                {getDocenteRanking().map((d, idx) => (
                  <div key={d.docente_id} className="flex items-center justify-between px-5 py-3 hover:bg-accent/5 transition-colors">
                    <div className="flex items-center gap-3">
                      {/* Position badge */}
                      <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold
                        ${idx === 0 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                          idx === 1 ? "bg-slate-200/60 text-slate-500 dark:bg-slate-800 dark:text-slate-400" :
                          idx === 2 ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" :
                          "bg-slate-100 text-muted-foreground dark:bg-slate-800"}`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground">{d.nombre_completo}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {d.secciones?.length || 0} secciones · {d.completed}/{d.total} documentos
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            d.pct === 100 ? "bg-emerald-500" : d.pct >= 50 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${d.pct}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-bold min-w-[36px] text-right ${
                        d.pct === 100 ? "text-emerald-600 dark:text-emerald-400" : d.pct >= 50 ? "text-amber-500" : "text-rose-500"
                      }`}>
                        {d.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Users className="size-8 opacity-30" />
                <span className="text-xs mt-2">Sin docentes registrados</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
