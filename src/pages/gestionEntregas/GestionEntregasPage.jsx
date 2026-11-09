import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { notify } from "@/components/shared/Notify";
import { getAllDocumentos } from "@/services/documentosControl";
import { getAllEntregas, toggleEntrega } from "@/services/controlEntrega";
import { getHistorialActividades } from "@/services/historialActividades";
import { useAuth } from "@/context/AuthContext";
import { getAllPnfs } from "@/services/pnfService";
import { useFormik } from "formik";
import SelectSearch from "@/components/shared/SelectSearch";


// Import custom subcomponents
import SettingsDrawer from "./SettingsDrawer";
import DocenteAccordion from "./DocenteAccordion";
import ActividadTimeline from "./ActividadTimeline";
import EstadisticasTab from "./EstadisticasTab";
import ReportesTab from "./ReportesTab";
import SkeletonGestionEntregas from "./SkeletonGestionEntregas";

export default function GestionEntregasPage() {
  // Breadcrumbs definition
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Control de Entregas", href: "/gestion_entregas" }
  ];

  // States
  const { user, lapsoActual } = useAuth();
  const [documentos, setDocumentos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pnfList, setPnfList] = useState([]);
  const [selectedPnfId, setSelectedPnfId] = useState(() => {
    return user?.pnf?.id || null;
  });

  const formikPnf = useFormik({
    initialValues: {
      pnfId: selectedPnfId || "",
    },
    onSubmit: () => {},
  });

  // Sincronizar seleccion de Formik con el estado selectedPnfId
  useEffect(() => {
    if (formikPnf.values.pnfId && formikPnf.values.pnfId !== selectedPnfId) {
      setSelectedPnfId(Number(formikPnf.values.pnfId));
    }
  }, [formikPnf.values.pnfId]);

  useEffect(() => {
    if (selectedPnfId && selectedPnfId !== formikPnf.values.pnfId) {
      formikPnf.setFieldValue("pnfId", selectedPnfId);
    }
  }, [selectedPnfId]);

  // Timeline Activity List
  const [actividades, setActividades] = useState([]);

  // ─── Fetch dashboard data (documentos + docentes) ───
  const fetchDashboard = async (silent = false, pnfId = null) => {
    try {
      if (!silent) setLoading(true);
      const activePnfId = pnfId || selectedPnfId || user?.pnf?.id || 1;
      const res = await getAllEntregas(activePnfId);
      setDocumentos(res.data.documentos || []);
      setDocentes(res.data.docentes || []);
    } catch (error) {
      console.error(error);
      notify.error("Error al cargar el dashboard de entregas.");
    } finally {
      if (!silent) setLoading(false);
    }
  };


  // ─── Fetch historial de actividades ───
  const fetchHistorial = async () => {
    try {
      const res = await getHistorialActividades();
      setActividades(res?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch list of PNFs if user is admin (has no associated PNF)
  useEffect(() => {
    if (!user?.pnf) {
      const fetchPnfs = async () => {
        try {
          const res = await getAllPnfs();
          const list = Array.isArray(res) ? res : (res.data || []);
          setPnfList(list);
          if (list.length > 0) {
            setSelectedPnfId(list[0].id);
          } else {
            setSelectedPnfId(1);
          }
        } catch (error) {
          console.error("Error fetching PNFs:", error);
          setSelectedPnfId(1);
        }
      };
      fetchPnfs();
    } else {
      setSelectedPnfId(user.pnf.id);
    }
  }, [user]);

  useEffect(() => {
    if (lapsoActual?.id && selectedPnfId) {
      fetchDashboard(false, selectedPnfId);
      fetchHistorial();
    }
  }, [lapsoActual?.id, selectedPnfId]);

  // ─── Fetch documentos list for SettingsDrawer ───
  const fetchDocumentos = async () => {
    try {
      const res = await getAllDocumentos();
      setDocumentos(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // ─── Handler: Toggle entrega with optimistic update ───
  const handleToggleEntrega = async (docenteId, tipoDocumentoId, seccionId, ucNombre, nuevoEstado, observaciones = null, accion = null, archivo = null, e = null, ucId = null, asignacionId = null) => {
    // 1. Optimistic update — update state immediately
    setDocentes((prev) =>
      prev.map((docente) => {
        if (docente.docente_id !== docenteId) return docente;

        if (seccionId === null) {
          // Documento institucional (alcance: docente)
          return {
            ...docente,
            entregas_globales: {
              ...docente.entregas_globales,
              [tipoDocumentoId]: {
                entregado: nuevoEstado,
                observaciones: observaciones || "",
                // Optimistic UI can't easily show the file url until fetched, but we keep the old if any
                archivo_url: docente.entregas_globales?.[tipoDocumentoId]?.archivo_url
              }
            }
          };
        } else {
          // Documento por sección
          return {
            ...docente,
            secciones: docente.secciones.map((sec) => {
              const matchesSeccion = String(sec.seccion_id) === String(seccionId);
              const matchesUc = String(sec.unidad_curricular_id) === String(ucId) || String(sec.uc_id) === String(ucId);

              if (!matchesSeccion || !matchesUc) return sec;

              return {
                ...sec,
                entregas: {
                  ...sec.entregas,
                  [tipoDocumentoId]: {
                    entregado: nuevoEstado,
                    observaciones: observaciones || "",
                    archivo_url: sec.entregas?.[tipoDocumentoId]?.archivo_url
                  }
                }
              };
            })
          };
        }
      })
    );

    // 2. Build FormData payload
    const formData = new FormData();
    formData.append('entregado', nuevoEstado ? 'true' : 'false');
    formData.append('tipo_documento_id', tipoDocumentoId);
    formData.append('docente_id', docenteId);
    if (lapsoActual?.id) formData.append('lapso_academico_id', lapsoActual.id);
    if (seccionId) formData.append('seccion_id', seccionId);
    if (ucNombre) {
      formData.append('uc_nombre', ucNombre);
      formData.append('unidad_curricular', ucNombre);
    }
    if (ucId) {
      formData.append('unidad_curricular_id', ucId);
      formData.append('uc_id', ucId);
    }
    if (asignacionId) {
      formData.append('asignacion_id', asignacionId);
    }
    if (observaciones) formData.append('observaciones', observaciones);
    if (accion) formData.append('accion', accion);
    if (archivo) formData.append('archivo', archivo);

    // 3. Send to backend
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    try {
      await toggleEntrega(formData);
      fetchDashboard(true, selectedPnfId); // silent fetch to prevent skeleton reload
      fetchHistorial();
    } catch (error) {
      console.error(error);
      if (error.response?.status !== 422) {
        notify.error("Error al actualizar la entrega. Revirtiendo cambio...");
        // Revert optimistic update on failure only if it's not a validation error
        setDocentes((prev) =>
          prev.map((docente) => {
            if (docente.docente_id !== docenteId) return docente;

            if (seccionId === null) {
              return {
                ...docente,
                entregas_globales: {
                  ...docente.entregas_globales,
                  [tipoDocumentoId]: { entregado: !nuevoEstado, observaciones: "" }
                }
              };
            } else {
              return {
                ...docente,
                secciones: docente.secciones.map((sec) => {
                  const matchesSeccion = String(sec.seccion_id) === String(seccionId);
                  const matchesUc = String(sec.unidad_curricular_id) === String(ucId) || String(sec.uc_id) === String(ucId);

                  if (!matchesSeccion || !matchesUc) return sec;

                  return {
                    ...sec,
                    entregas: {
                      ...sec.entregas,
                      [tipoDocumentoId]: { entregado: !nuevoEstado, observaciones: "" }
                    }
                  };
                })
              };
            }
          })
        );
      }
      throw error; // Re-throw to be handled by caller (e.g. Formik)
    }
  };

  // ─── Handler: Add deliverable from SettingsDrawer ───
  const handleAddDeliverable = (newDoc, formikHelpers) => {
    if (!newDoc) return;
    setDocumentos((prev) => [...prev, newDoc]);
    notify.success(`Entregable "${newDoc.nombre}" creado exitosamente.`);
    if (formikHelpers) {
      formikHelpers.resetForm();
    }
  };

  // ─── Handler: Delete deliverable from SettingsDrawer ───
  const handleDeleteDeliverable = (id) => {
    setDocumentos((prev) => prev.filter((d) => d.id !== id));
  };

  if (loading) {
    return <SkeletonGestionEntregas />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Institucional */}
      <div>
        <h1 className="mb-2 font-sans text-3xl capitalize font-semibold text-foreground tracking-tight">
          Control de Entregas de Documentos
        </h1>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <BreadcrumbReusable items={breadcrumbItems} />
          {!user?.pnf && pnfList.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Seleccionar PNF:
              </label>
              <div className="w-full md:w-[480px]">
                <SelectSearch
                  name="pnfId"
                  options={pnfList}
                  formik={formikPnf}
                  valueKey="id"
                  labelKey="nombre"
                  placeholder="Seleccione PNF..."
                  div_style="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Menu Wrapper */}
      <Tabs defaultValue="seguimiento" className="w-full">
        {/* Navigation line including tabs trigger and settings button */}
        <div className="flex items-center justify-between border-b border-border pb-2 mb-6">
          <TabsList className="bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="seguimiento" className="px-4 py-2 text-sm font-semibold transition-colors">
              Seguimiento de Docentes
            </TabsTrigger>
            <TabsTrigger value="estadisticas" className="px-4 py-2 text-sm font-semibold transition-colors">
              Estadísticas
            </TabsTrigger>
            {/* <TabsTrigger value="reportes" className="px-4 py-2 text-sm font-semibold transition-colors">
              Reportes
            </TabsTrigger> */}
          </TabsList>

          {/* Settings Drawer Subcomponent */}
          <SettingsDrawer
            activeDeliverables={documentos}
            onAddDeliverable={handleAddDeliverable}
            onDeleteDeliverable={handleDeleteDeliverable}
          />
        </div>

        {/* 1. Seguimiento de Docentes Content */}
        <TabsContent value="seguimiento">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 mt-6">
            {/* Main Column (75%) */}
            <div className="lg:col-span-3 space-y-4">
              <DocenteAccordion
                docentes={docentes}
                documentos={documentos}
                onToggleEntrega={handleToggleEntrega}
                loading={loading}
              />
            </div>

            {/* Sidebar Column (25%) */}
            <div className="lg:col-span-1 space-y-5">
              <ActividadTimeline actividades={actividades} />
            </div>
          </div>
        </TabsContent>

        {/* 2. Estadísticas Content */}
        <TabsContent value="estadisticas">
          <EstadisticasTab
            docentes={docentes}
            activeDeliverables={documentos}
          />
        </TabsContent>

        {/* 3. Reportes Content */}
        <TabsContent value="reportes">
          <ReportesTab
            docentes={docentes}
            activeDeliverables={documentos}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
