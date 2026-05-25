import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { notify } from "@/components/shared/Notify";
import { getAllDocumentos } from "@/services/documentosControl";
import { getAllEntregas } from "@/services/controlEntrega";
import { getHistorialActividades, createHistorialActividad } from "@/services/historialActividades";
import { useAuth } from "@/context/AuthContext";

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
  const { lapsoActual } = useAuth();
  const [documentos, setDocumentos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Timeline Activity List
  const [actividades, setActividades] = useState([]);
  
  // ─── Fetch dashboard data (documentos + docentes) ───
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getAllEntregas();
      setDocumentos(res.data.documentos || []);
      setDocentes(res.data.docentes || []);

    } catch (error) {
      console.error(error);
      notify.error("Error al cargar el dashboard de entregas.");
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchDashboard();
    fetchHistorial();
  }, []);

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
  const handleToggleEntrega = async (docenteId, tipoDocumentoId, seccionId, nuevoEstado, observaciones = null) => {
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
              [tipoDocumentoId]: { entregado: nuevoEstado, observaciones: observaciones || "" }
            }
          };
        } else {
          // Documento por sección
          return {
            ...docente,
            secciones: docente.secciones.map((sec) => {
              if (sec.seccion_id !== seccionId) return sec;
              return {
                ...sec,
                entregas: {
                  ...sec.entregas,
                  [tipoDocumentoId]: { entregado: nuevoEstado, observaciones: observaciones || "" }
                }
              };
            })
          };
        }
      })
    );

    // 2. Build payload
    const payload = {
      docente_id: docenteId,
      tipo_documento_id: tipoDocumentoId,
      seccion_id: seccionId,
      entregado: nuevoEstado,
      lapso_academico_id: lapsoActual?.id
    };

    if (observaciones !== null && observaciones.trim() !== "") {
      payload.observaciones = observaciones;
    }

    // 3. Send to backend
    try {
      await createHistorialActividad(payload);
      fetchHistorial();
    } catch (error) {
      console.error(error);
      notify.error("Error al actualizar la entrega. Revirtiendo cambio...");
      // Revert optimistic update on failure
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
                if (sec.seccion_id !== seccionId) return sec;
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
