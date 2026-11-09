import React, { useEffect, useState } from "react";
import { notify } from "@/components/shared/Notify";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { obtenerDatosIniciales, prepararPaso1, obtenerDatosPaso2 } from "@/services/proyeccionService";
import ProyeccionSkeleton from "./ProyeccionSkeleton";
import Paso1Secciones from "./Paso1Secciones";
import Paso2Calculo from "./Paso2Calculo";
import Paso3Revision from "./Paso3Revision";
import { Badge } from "@/components/ui/badge";
import { ClipboardEdit, Sparkles, CheckCircle2 } from "lucide-react";

// Títulos de la pestaña del navegador por paso del wizard
const WIZARD_TITLES = {
  1: "Paso 1: Configuración de Proyección | PNFI",
  2: "Paso 2: Edición y Grupos | PNFI",
  3: "Paso 3: Cierre de Proyección | PNFI",
};

// Keys de sessionStorage del wizard
const SS_KEYS = {
  proyeccion_id: "wizard_proyeccion_id",
  paso_actual: "wizard_paso_actual",
  ano_id: "wizard_ano_id",
  pnf_id: "wizard_pnf_id",
};

// Limpia todas las keys del wizard del sessionStorage
const limpiarWizardStorage = () => {
  Object.values(SS_KEYS).forEach((key) => sessionStorage.removeItem(key));
};

// Breadcrumbs definition
const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Proyecciones Académicas", href: "/proyecciones" },
];

export default function Proyecciones() {
  // Wizard States
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);

  // Actualizar título de la pestaña según el paso activo del wizard
  useEffect(() => {
    document.title = WIZARD_TITLES[currentStep] ?? "Proyecciones Académicas | PNFI";
  }, [currentStep]);
  const [selection, setSelection] = useState({
    ano_academico_id: "",
    pnf_id: "",
    secciones: [],
    proyeccion_id: null,
    ano_proyectado: null,
    ano_origen_historico: null,
  });
  const [detallesProyeccion, setDetallesProyeccion] = useState([]);

  // Catalog States
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [anosAcademicos, setAnosAcademicos] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pnfCoordinadorId, setPnfCoordinadorId] = useState(null);
  const [pnfs, setPnfs] = useState([]);

  // Fetch initial data on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingInitial(true);
        const res = await obtenerDatosIniciales();

        const rawData = res?.anos_academicos !== undefined
          ? res
          : (res?.data?.anos_academicos !== undefined ? res.data : (res?.data || res || {}));

        const anosList = rawData?.anos_academicos || [];
        setAnosAcademicos(anosList);
        setIsAdmin(!!rawData?.is_admin || !!rawData?.isAdmin);
        setPnfCoordinadorId(rawData?.pnf_coordinador_id || rawData?.pnfCoordinadorId || null);
        setPnfs(rawData?.pnfs || []);

        // ── REHIDRATACIÓN DESDE sessionStorage ──
        // Se ejecuta después de tener los datos de catálogo para poder calcular anos
        const savedProyeccionId = sessionStorage.getItem(SS_KEYS.proyeccion_id);
        const savedPaso = sessionStorage.getItem(SS_KEYS.paso_actual);
        const savedAnoId = sessionStorage.getItem(SS_KEYS.ano_id);
        const savedPnfId = sessionStorage.getItem(SS_KEYS.pnf_id);

        if (savedProyeccionId && savedAnoId && savedPnfId) {
          // Intentar cargar la plantilla nuevamente para rehidratar la tabla
          try {
            const data = await prepararPaso1({
              ano_academico_id: Number(savedAnoId),
              pnf_id: Number(savedPnfId),
            });

            const rawResp = data?.data || data || {};
            const plantilla = rawResp?.plantilla || [];
            const proyeccionId = rawResp?.proyeccion_id || Number(savedProyeccionId);

            // Calcular años a partir del catálogo
            const anoSelect = anosList.find((a) => String(a.id) === String(savedAnoId));
            const anoProyectado = anoSelect?.ano || null;
            const anoOrigen = anoProyectado ? anoProyectado - 1 : null;

            setSelection({
              ano_academico_id: savedAnoId,
              pnf_id: savedPnfId,
              secciones: plantilla,
              proyeccion_id: proyeccionId,
              ano_proyectado: anoProyectado,
              ano_origen_historico: anoOrigen,
            });

            const paso = Number(savedPaso) || 1;
            const pasoValido = [1, 2, 3].includes(paso) ? paso : 1;

            if (pasoValido >= 2) {
              try {
                const dataPaso2 = await obtenerDatosPaso2(proyeccionId);
                const rawPaso2 = dataPaso2?.resumen_métricas !== undefined ? dataPaso2 : (dataPaso2?.data || {});
                if (rawPaso2?.detalles) {
                  setDetallesProyeccion(rawPaso2.detalles);
                }
              } catch (errPaso2) {
                console.warn("No se pudo rehidratar detalles del paso 2:", errPaso2);
              }
            }

            setCurrentStep(pasoValido);
            setMaxStepReached(pasoValido);
          } catch (err) {
            console.warn("No se pudo rehidratar el wizard desde sessionStorage:", err);
            limpiarWizardStorage();
          }
        }
      } catch (error) {
        console.error(error);
        notify.error("Error al cargar los datos iniciales de proyección.");
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchInitialData();
  }, []);

  if (loadingInitial) {
    return <ProyeccionSkeleton />;
  }

  // Stepper steps config
  const steps = [
    { id: 1, label: "Plantilla Base", desc: "Revisar/editar histórico" },
    { id: 2, label: "Cálculo de Proyección", desc: "Simular distribución" },
    { id: 3, label: "Revisión Final", desc: "Reportes y consolidado" },
  ];

  return (
    <div className="space-y-6">
      {/* ── HEADER DE PÁGINA ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div className="space-y-1">
          <h1 className="font-sans text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Proyecciones Académicas
          </h1>
          <BreadcrumbReusable items={breadcrumbItems} />
        </div>

        {/* Badge de estado del asistente */}
        <div className="flex items-center gap-2">
          {currentStep === 1 ? (
            <Badge className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 rounded-xl shadow-sm">
              <ClipboardEdit className="w-3.5 h-3.5" />
              Edición de Plantilla
            </Badge>
          ) : currentStep === 2 ? (
            <Badge className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-400 rounded-xl shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Simulación de Matrícula
            </Badge>
          ) : (
            <Badge className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Consolidación Final
            </Badge>
          )}
        </div>
      </div>

      {/* ── STEPPER (INDICADOR DE PASOS WIZARD) ── */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm">
        <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            const isClickable = step.id <= maxStepReached;

            return (
              <React.Fragment key={step.id}>
                {/* Paso Individual */}
                <div
                  onClick={() => isClickable && setCurrentStep(step.id)}
                  className={`flex flex-col md:flex-row items-center gap-3 transition-all duration-300 ${isClickable ? "cursor-pointer hover:opacity-90" : "cursor-not-allowed opacity-45"
                    }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all duration-300 ${isCompleted
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                      : isActive
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                        : "bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                      }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col text-center md:text-left">
                    <span
                      className={`text-xs font-bold ${isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : isCompleted
                          ? "text-slate-800 dark:text-slate-200"
                          : "text-slate-400 dark:text-slate-500"
                        }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[150px] leading-tight">
                      {step.desc}
                    </span>
                  </div>
                </div>

                {/* Línea Conectora */}
                {index < steps.length - 1 && (
                  <div className="flex-1 hidden sm:block h-0.5 min-w-[20px] max-w-[120px] rounded-full overflow-hidden bg-slate-150 dark:bg-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${isCompleted ? "bg-emerald-600 w-full" : "bg-transparent w-0"
                        }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── RENDIMIENTO DE CONTENIDO SEGÚN PASO ACTIVO ── */}
      <div className="transition-all duration-300">
        {currentStep === 1 && (
          <Paso1Secciones
            anosAcademicos={anosAcademicos}
            pnfs={pnfs}
            isAdmin={isAdmin}
            pnfCoordinadorId={pnfCoordinadorId}
            initialSelection={selection}
            onStepComplete={(data) => {
              const anoSelect = anosAcademicos.find(a => String(a.id) === String(data.ano_academico_id));
              const anoProyectado = anoSelect?.ano || null;
              const anoOrigen = anoProyectado ? anoProyectado - 1 : null;

              const newSelection = {
                ...data,
                ano_proyectado: anoProyectado,
                ano_origen_historico: anoOrigen,
              };
              setSelection(newSelection);

              // Persistir transición al Paso 2
              sessionStorage.setItem(SS_KEYS.proyeccion_id, String(data.proyeccion_id));
              sessionStorage.setItem(SS_KEYS.paso_actual, "2");
              sessionStorage.setItem(SS_KEYS.ano_id, String(data.ano_academico_id));
              sessionStorage.setItem(SS_KEYS.pnf_id, String(data.pnf_id));

              setMaxStepReached(Math.max(maxStepReached, 2));
              setCurrentStep(2);
            }}
          />
        )}

        {currentStep === 2 && (
          <Paso2Calculo
            selection={selection}
            anoProyectado={anosAcademicos.find(a => String(a.id) === String(selection.ano_academico_id))?.ano}
            anoOrigenHistorico={(anosAcademicos.find(a => String(a.id) === String(selection.ano_academico_id))?.ano ?? null) != null
              ? (anosAcademicos.find(a => String(a.id) === String(selection.ano_academico_id)).ano - 1)
              : null}
            onBack={() => setCurrentStep(1)}
            onNext={(detalles) => {
              setDetallesProyeccion(detalles || []);

              // Persistir transición al Paso 3
              sessionStorage.setItem(SS_KEYS.paso_actual, "3");

              setMaxStepReached(Math.max(maxStepReached, 3));
              setCurrentStep(3);
            }}
          />
        )}

        {currentStep === 3 && (
          <Paso3Revision
            selection={selection}
            detalles={detallesProyeccion}
            onBack={() => setCurrentStep(2)}
            onFinish={() => {
              // Limpiar sessionStorage al finalizar exitosamente
              limpiarWizardStorage();

              // Resetear wizard al estado inicial
              setCurrentStep(1);
              setMaxStepReached(1);
              setSelection({
                ano_academico_id: "",
                pnf_id: "",
                secciones: [],
                proyeccion_id: null,
                ano_proyectado: null,
                ano_origen_historico: null,
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
