import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { RadioGroup } from "@/components/ui/radio-group";
import { LogIn, LogOut, ArrowLeftRight,} from "lucide-react";

// Importamos nuestros componentes locales
import MovementOption from "./MovementOption";
import FormField from "./FormField";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import RecentMovements from "./RecentMovements";
import { useFormik } from "formik";
import { ModernInput } from "@/components/shared/InputModerno";
import SelectSearch from "@/components/shared/SelectSearch";
import { SkeletonInventario } from "@/components/shared/SkeletonInventario";

const Inventario = () => {
  const [tipo, setTipo] = useState("entrada");
  const [loading, setLoading] = useState(false);

  // Configuración de Formik
  const formik = useFormik({
    initialValues: {
      activo: "",
      origen: "",
      destino: "",
      cantidad: 1,
      referencia: "",
      observaciones: "",
    },
    onSubmit: (values) => {
      console.log("Datos del movimiento:", { ...values, tipo });
    },
  });

  // Estilo común para los inputs
  useEffect(() => {
    const simulateLoading = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 1500); // Simulamos carga de datos
    };
    simulateLoading();
  }, []);

  const items = [
    { label: "Home", href: "/" },
    { label: "Inventario", href: "/inventario" },
  ];

  if (loading) {
    return <SkeletonInventario />;
  }

  // Opciones de ejemplo para los selectores
  const opcionesAlmacen = [
    { id: "1", nombre: "Almacén Central (AC-01)" },
    { id: "2", nombre: "Sucursal Norte (SN-05)" },
    { id: "3", nombre: "Depósito Externo (DE-02)" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="mb-4">Inventario</h1>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb para la Navegación  */}
        <BreadcrumbReusable items={items} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-8 shadow-lg border-gray-100">
            <div className="space-y-8">
              {/* Selector de Movimiento (Componentes Reutilizables) */}
              <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Tipo de Movimiento
                </Label>
                <RadioGroup
                  defaultValue="entrada"
                  onValueChange={setTipo}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <MovementOption id="entrada" label="Entrada" icon={LogIn} />
                  <MovementOption id="salida" label="Salida" icon={LogOut} />
                  <MovementOption
                    id="traslado"
                    label="Traslado"
                    icon={ArrowLeftRight}
                  />
                </RadioGroup>
              </div>

              {/* Área de Formulario Dinámico */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="md:col-span-2">
                  <FormField label="Bien / Activo">
                    <ModernInput
                      name="activo"
                      placeholder="Buscar por nombre o SKU..."
                      onChange={formik.handleChange}
                      value={formik.values.activo}
                    />
                  </FormField>
                </div>

                {/* Renderizado Condicional */}
                {(tipo === "entrada" || tipo === "traslado") && (
                  <FormField label="Ubicación de Origen">
                    <SelectSearch 
                      name="origen"
                      options={opcionesAlmacen}
                      formik={formik}
                      placeholder="SELECCIONE ORIGEN"
                      div_style="w-full"
                    />
                  </FormField>
                )}

                {(tipo === "salida" || tipo === "traslado") && (
                  <FormField label="Ubicación de Destino">
                    <SelectSearch 
                      name="destino"
                      options={opcionesAlmacen}
                      formik={formik}
                      placeholder="SELECCIONE DESTINO"
                      div_style="w-full"
                    />
                  </FormField>
                )}

                {/* Cantidad y Referencia */}
                <FormField label="Cantidad">
                  <ModernInput 
                    name="cantidad"
                    type="number"
                    onChange={formik.handleChange}
                    value={formik.values.cantidad}
                  />
                </FormField>

                <FormField label="Referencia / No. Guía">
                  <ModernInput 
                    name="referencia"
                    placeholder="REF-0000"
                    onChange={formik.handleChange}
                    value={formik.values.referencia}
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Observaciones">
                    <textarea 
                      name="observaciones"
                      className="w-full p-3 bg-gray-200 dark:bg-slate-800/40 rounded-xl outline-none focus:bg-gray-100 transition-all text-sm min-h-[100px] resize-none"
                      placeholder="Notas técnicas del movimiento..."
                      onChange={formik.handleChange}
                      value={formik.values.observaciones}
                    />
                    </FormField>
                  </div>
                </div>


              {/* Botones */}
              <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
                <Button type="submit">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
        {/* Componente de Movimientos Recientes */}
        <div className="lg:col-span-1">
          <RecentMovements />
        </div>
      </div>
    </div>
  );
};

export default Inventario;
