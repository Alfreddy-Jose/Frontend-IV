import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Layers,
  Users,
  Megaphone,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Timer,
  BookOpen,
  TrendingUp,
  Activity,
  Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Impuntamos Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { getDashboardData } from '../services/dashboardService';
import { useAuth } from '@/context/AuthContext';

// Datos por defecto (fallback en caso de que la API aún cargue o falle)
const DEFAULT_MOCK_DATA = {
  resumen_lapso: {
    nombre: "Lapso Académico 2026-I",
    fecha_inicio: "2026-03-15",
    fecha_fin: "2026-07-15",
    porcentaje_transcurrido: 52
  },
  metricas_generales: {
    total_matricula: 450,
    total_secciones: 18,
    total_docentes: 32,
    total_voceros: 18
  },
  control_entregas_recientes: [
    { id: 1, docente: "Ing. Carlos Mendoza", unidad_curricular: "Algorítmica y Programación", trayecto: "Trayecto I", entrega: "Planificación Trimestral", estatus: "pendiente" },
    { id: 2, docente: "MSc. Elena Rivas", unidad_curricular: "Bases de Datos", trayecto: "Trayecto II", entrega: "Notas Primer Corte", estatus: "completado" },
    { id: 3, docente: "Ing. José Anzola", unidad_curricular: "Proyecto Socio-Tecnológico III", trayecto: "Trayecto III", entrega: "Avance de Proyecto", estatus: "retrasado" }
  ],
  secciones_por_trayecto: [
    { trayecto: "Trayecto I", cantidad: 6 },
    { trayecto: "Trayecto II", cantidad: 5 },
    { trayecto: "Trayecto III", cantidad: 4 },
    { trayecto: "Trayecto IV", cantidad: 3 }
  ],
  grafica_entregas: [
    { label: "Trayecto I", percentage: 65, color: "#3b82f6" },
    { label: "Trayecto II", percentage: 80, color: "#06b6d4" },
    { label: "Trayecto III", percentage: 42, color: "#6366f1" },
    { label: "Trayecto IV", percentage: 92, color: "#a855f7" },
    { label: "Institucional", percentage: 55, color: "#ec4899" },
    { label: "Electivas", percentage: 70, color: "#10b981" },
  ]
};

const formatTrayectoName = (trayecto) => {
  if (!trayecto) return "";
  const trayectoStr = String(trayecto).trim();
  return /^\d+$/.test(trayectoStr) ? `Trayecto ${trayectoStr}` : trayectoStr;
};

const formatDateInSpanish = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const getInitials = (name) => {
  if (!name) return "";
  const cleanName = name.replace(/^(Ing\.|MSc\.|Dr\.|Dra\.|Prof\.)\s+/i, "");
  const parts = cleanName.split(" ");
  return parts.map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
};

function KpiCard({ title, value, icon: Icon, colorClass, description }) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/20 py-4">
      <CardContent className="p-4 py-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              {title}
            </p>
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              {value}
            </h3>
            {description && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">
                {description}
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-lg ${colorClass} transition-colors shrink-0`}>
            <Icon className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Tooltip personalizado para la gráfica de Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 dark:bg-slate-800 text-white p-2 rounded-lg shadow-md text-xs font-semibold">
        <p className="font-bold">{label}</p>
        <p className="text-indigo-300">{`Avance: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

function Dashboard({ initialData = null }) {
  const { lapsoActual } = useAuth();
  const [dashboardData, setDashboardData] = useState(initialData || DEFAULT_MOCK_DATA);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData(lapsoActual?.id);
        if (data) {
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Error al cargar los datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialData, lapsoActual?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Cargando métricas del sistema...</p>
      </div>
    );
  }

  const {
    resumen_lapso,
    metricas_generales,
    control_entregas_recientes,
    secciones_por_trayecto,
    grafica_entregas
  } = dashboardData;

  const currentFormattedDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const capitalizedDate = currentFormattedDate.charAt(0).toUpperCase() + currentFormattedDate.slice(1);

  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completado':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 hover:bg-emerald-500/15 gap-1 py-0.5 text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Completado
          </Badge>
        );
      case 'pendiente':
        return (
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 hover:bg-amber-500/15 gap-1 py-0.5 text-[11px] font-medium">
            <Timer className="w-3 h-3" />
            Pendiente
          </Badge>
        );
      case 'retrasado':
        return (
          <Badge className="bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30 hover:bg-rose-500/15 gap-1 py-0.5 text-[11px] font-medium">
            <AlertCircle className="w-3 h-3" />
            Retrasado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 py-0.5 text-[11px]">
            {status}
          </Badge>
        );
    }
  };

  const getTrayectoGradient = (trayecto) => {
    const cleanTrayecto = String(trayecto || "").trim().toLowerCase();
    switch (cleanTrayecto) {
      case 'trayecto i':
      case 'trayecto 1':
      case '1':
        return 'from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600';
      case 'trayecto ii':
      case 'trayecto 2':
      case '2':
        return 'from-indigo-500 to-blue-500 dark:from-indigo-600 dark:to-blue-600';
      case 'trayecto iii':
      case 'trayecto 3':
      case '3':
        return 'from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-600';
      case 'trayecto iv':
      case 'trayecto 4':
      case '4':
        return 'from-pink-500 to-rose-500 dark:from-pink-600 dark:to-rose-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-1 animate-fade-in">

      {/* HEADER SECTION */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Coordinación PNFI
            </span>
            <span className="text-slate-400 dark:text-slate-600 text-xs">•</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
              SGAI
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Dashboard de Gestión
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Seguimiento académico del Programa Nacional de Formación en Informática.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl w-fit">
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>{capitalizedDate}</span>
        </div>
      </div>

      {/* TOP SECTION: RECHARTS BAR CHART (2/3) AND KPI CARDS (1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* RECHARTS CHART CONTAINER */}
        <div className="lg:col-span-2">
          <Card className="relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm h-full flex flex-col justify-between">
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-50">
                    Seguimiento de Progreso
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Rendimiento de entregas y avance cronológico en el {resumen_lapso?.nombre}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs font-semibold border border-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  En Curso
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10 flex-grow flex flex-col justify-between">

              {/* COMPONENTE RECHARTS */}
              <div className="h-[230px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={grafica_entregas || DEFAULT_MOCK_DATA.grafica_entregas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      unit="%"
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                    <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                      {(grafica_entregas || DEFAULT_MOCK_DATA.grafica_entregas).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* BARRA DE AVANCE */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-indigo-650 dark:text-indigo-400">
                    Avance Cronológico del Lapso
                  </span>
                  <span className="text-sm font-bold text-indigo-750 dark:text-indigo-400">
                    {resumen_lapso?.porcentaje_transcurrido}% Transcurrido
                  </span>
                </div>
                <Progress value={resumen_lapso?.porcentaje_transcurrido} className="h-2.5" />
              </div>

              {/* DATES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-start gap-3 p-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <div className="p-1.5 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 rounded-lg shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                      Fecha de Inicio
                    </p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-400 mt-0.5">
                      {formatDateInSpanish(resumen_lapso?.fecha_inicio)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <div className="p-1.5 bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 rounded-lg shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                      Fecha de Cierre
                    </p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-400 mt-0.5">
                      {formatDateInSpanish(resumen_lapso?.fecha_fin)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* METRICS COLUMN */}
        <div className="lg:col-span-1 flex flex-col justify-between gap-4">
          <KpiCard
            title="Matrícula Total"
            value={metricas_generales?.total_matricula}
            icon={Users}
            colorClass="bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
            description="Estudiantes inscritos activos"
          />
          <KpiCard
            title="Secciones Activas"
            value={metricas_generales?.total_secciones}
            icon={Layers}
            colorClass="bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
            description="Secciones distribuidas"
          />
          <KpiCard
            title="Docentes Registrados"
            value={metricas_generales?.total_docentes}
            icon={GraduationCap}
            colorClass="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
            description="Personal docente asignado"
          />
          <KpiCard
            title="Voceros de Sección"
            value={metricas_generales?.total_voceros}
            icon={Megaphone}
            colorClass="bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
            description="Enlaces de comunicación"
          />
        </div>

      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* RECENT DELIVERIES TABLE */}
        <div className="lg:col-span-2">
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm overflow-hidden h-fit">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    Control de Entregas Recientes
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Monitoreo y estatus de los últimos entregables académicos cargados por docentes.
                  </CardDescription>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-400 rounded-lg">
                  <Activity className="w-4.5 h-4.5" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-y border-slate-200 dark:border-slate-800">
                  <TableRow>
                    <TableHead className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs">
                      Docente
                    </TableHead>
                    <TableHead className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs">
                      Unidad Curricular
                    </TableHead>
                    <TableHead className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs">
                      Trayecto
                    </TableHead>
                    <TableHead className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs">
                      Entrega
                    </TableHead>
                    <TableHead className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs text-right">
                      Estatus
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-150 dark:divide-slate-800/85">
                  {control_entregas_recientes && control_entregas_recientes.length > 0 ? (
                    control_entregas_recientes.map((entrega) => (
                      <TableRow key={entrega.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                              {getInitials(entrega.docente)}
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-400 text-sm">
                              {entrega.docente}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-slate-650 dark:text-slate-350 text-sm">
                              {entrega.unidad_curricular}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <Badge variant="outline" className="border-indigo-100 bg-indigo-50/20 text-indigo-700 dark:border-indigo-950/40 dark:bg-indigo-950/10 dark:text-indigo-350 font-medium text-[11px] px-2 py-0.5">
                            {entrega.trayecto}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                            {entrega.entrega}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          {renderStatusBadge(entrega.estatus)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-400 dark:text-slate-500">
                        No hay registros de entregas recientes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* TRAYECTO SECTIONS */}
        <div className="lg:col-span-1">
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm h-full flex flex-col justify-between overflow-hidden">
            <div>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    Secciones por Trayecto
                  </CardTitle>
                  <div className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-400 rounded-lg">
                    <TrendingUp className="w-4.5 h-4.5" />
                  </div>
                </div>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Distribución proporcional del total de {metricas_generales?.total_secciones || 0} secciones.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {secciones_por_trayecto && secciones_por_trayecto.length > 0 ? (
                    secciones_por_trayecto.map((item, idx) => {
                      const totalSec = metricas_generales?.total_secciones || 1;
                      const rawPercentage = Math.round((item.cantidad / totalSec) * 100);
                      const barGradient = getTrayectoGradient(item.trayecto);

                      return (
                        <div key={idx} className="group space-y-1.5 p-1 px-2 rounded-xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-550 group-hover:scale-125 transition-transform duration-300" />
                              <span className="font-semibold text-slate-800 dark:text-slate-300">
                                {formatTrayectoName(item.trayecto)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-slate-900 dark:text-slate-100">
                                {item.cantidad}
                              </span>
                              <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
                                ({rawPercentage}%)
                              </span>
                            </div>
                          </div>

                          <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500 ease-in-out`}
                              style={{ width: `${rawPercentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">
                      No hay datos de distribución disponibles.
                    </p>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;