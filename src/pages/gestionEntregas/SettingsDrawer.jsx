import React, { useState } from "react";
import { Settings, Trash2, Plus, Loader2, CalendarDays, Save } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { notify } from "@/components/shared/Notify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ModernInput } from "@/components/shared/InputModerno";
import SelectSearch from "@/components/shared/SelectSearch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createDocumento, deleteDocumento } from "@/services/documentosControl";
import { useAuth } from "@/context/AuthContext";

export default function SettingsDrawer({
  activeDeliverables,
  onAddDeliverable,
  onDeleteDeliverable
}) {
  const { lapsoActual } = useAuth();
  const [deletingId, setDeletingId] = useState(null);

  // Validation schema: Nombre must be letters only
  const validationSchema = Yup.object({
    nombre: Yup.string()
      .required("Este campo es obligatorio")
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras en el nombre del documento"),
    alcance: Yup.string().required("Este campo es obligatorio")
  });

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      nombre: "",
      alcance: "docente"
    },
    validationSchema,
    onSubmit: async (values, formikHelpers) => {
      try {
        const response = await createDocumento(values);
        // Obtenemos el objeto creado desde la respuesta
        let newDoc = response.documento || response.data || response;

        // Si la respuesta no es un objeto válido, o es un array, reconstruimos el documento base
        if (typeof newDoc !== 'object' || Array.isArray(newDoc)) {
          newDoc = { ...values };
        } else {
          // Asegurar que no perdemos las propiedades originales si el backend devuelve un objeto incompleto
          newDoc = { ...values, ...newDoc };
        }

        // Verificar si el id devuelto por el backend ya existe en nuestra lista actual
        const isDuplicate = activeDeliverables.some((d) => d.id === newDoc.id);

        // Fallback robusto: si no hay id o es un id duplicado, generamos uno estrictamente único
        if (!newDoc.id || isDuplicate) {
          newDoc.id = `temp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        }

        onAddDeliverable(newDoc, formikHelpers);
        console.log(response);
      } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 422) {
          const laravelErrors = error.response.data.errors;
          const formikErrors = {};
          Object.keys(laravelErrors).forEach((key) => {
            formikErrors[key] = laravelErrors[key][0];
          });
          formikHelpers.setErrors(formikErrors);
        } else {
          notify.error("Error al crear el documento.");
        }
      }
    }
  });

  // Handle delete document with dynamic loading state
  const handleDelete = async (id, label) => {
    try {
      setDeletingId(id);
      await deleteDocumento(id);
      notify.success(`Entregable "${label}" eliminado con éxito.`);
      onDeleteDeliverable(id);
    } catch (error) {
      console.error(error);
      notify.error(`Error al eliminar el entregable "${label}".`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 cursor-pointer shadow-sm">
          <Settings className="size-4 animate-spin-hover" />
          <span>Configuración de Entregables</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md border-l border-border bg-background shadow-2xl p-0 flex flex-col h-full">
        <SheetHeader className="p-6 border-b border-border bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-primary">
            <Settings className="size-5" />
            <SheetTitle className="text-lg font-bold text-foreground">Configuración de Entregables</SheetTitle>
          </div>
          <SheetDescription className="text-xs text-muted-foreground mt-1">
            Establece la lista y requisitos de los entregables que los docentes deben consignar para este lapso académico.
          </SheetDescription>
        </SheetHeader>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Lapso Selection */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Lapso Académico Activo</h4>
            <div className="space-y-1.5">
              {!lapsoActual ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-border text-center">
                  <span className="text-xs text-muted-foreground">No hay lapso activo seleccionado.</span>
                </div>
              ) : (
                <div className="p-3 rounded-lg border flex items-center justify-between group bg-primary/5 border-primary/30 ring-1 ring-primary/20 dark:bg-primary/10 dark:border-primary/40">
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-md flex items-center justify-center transition-colors bg-primary/10 text-primary dark:bg-primary/20">
                      <CalendarDays className="size-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold leading-tight text-primary dark:text-primary">
                        {lapsoActual.nombre_lapso}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {lapsoActual.fecha_inicio} — {lapsoActual.fecha_fin} · {lapsoActual.tipolapso?.nombre}
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] shrink-0">
                    Seleccionado
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* List of Current Deliverables */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Entregables Requeridos</h4>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                {activeDeliverables.length} plantillas
              </span>
            </div>

            <div className="space-y-2">
              {activeDeliverables.map((del) => (
                <div
                  key={del.id}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{del.nombre}</span>
                    <span className="text-[10px] text-muted-foreground">(Alcance: {del.alcance === "seccion" ? "Sección" : "Docente"})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {deletingId === del.id ? (
                      <Loader2 className="size-4 animate-spin text-destructive" />
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(del.id, del.nombre)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="Eliminar plantilla"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Deliverable form */}
          <form onSubmit={formik.handleSubmit} className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-dashed border-border rounded-xl space-y-4">
            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
              <Plus className="size-3.5 text-primary" />
              <span>Añadir Nuevo Entregable</span>
            </h4>

            {/* Input 1: Nombre del Documento */}
            <div className="space-y-1.5 flex flex-col">
              <Label htmlFor="nombre" className="text-xs font-semibold text-foreground">Nombre del Documento</Label>
              <ModernInput
                id="nombre"
                name="nombre"
                placeholder="Ej: Plan de Evaluación"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.nombre}
              />
              {formik.errors.nombre && (
                <p className="text-[11px] text-red-500 font-medium mt-0.5">
                  {formik.errors.nombre}
                </p>
              )}
            </div>

            {/* Input 2: Alcance del Documento */}
            <div className="space-y-1.5 flex flex-col">
              <Label htmlFor="alcance" className="text-xs font-semibold text-foreground">Alcance del Documento</Label>
              <SelectSearch
                name="alcance"
                options={[
                  { id: "docente", nombre: "Por Docente" },
                  { id: "seccion", nombre: "Por Sección" }
                ]}
                formik={formik}
                placeholder="SELECCIONE EL ALCANCE"
                div_style="w-full"
              />
              {formik.errors.alcance && (
                <p className="text-[11px] text-red-500 font-medium mt-0.5">
                  {formik.errors.alcance}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="sm"
              className="w-full cursor-pointer shadow-xs flex items-center justify-center gap-2"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save />
                  Guardar
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Drawer Footer */}
        <SheetFooter className="p-4 border-t border-border bg-slate-50 dark:bg-slate-900/50 flex flex-row items-center justify-between gap-2 mt-auto">
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 cursor-pointer">
              Cerrar
            </Button>
          </SheetTrigger>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
