import { useFormik } from "formik";
import { useAuth } from "@/context/AuthContext";
import SelectSearch from "@/components/shared/SelectSearch";
import { useEffect } from "react";

export default function SelectorLapso() {
  const { lapsos, lapsoActual, setLapsoActual } = useAuth();

  const formik = useFormik({
    initialValues: {
      lapsoId: lapsoActual?.id || "",
    },
    onSubmit: () => {},
  });

  // Sincronizar formik cuando cambia el contexto desde otro lado
  useEffect(() => {
    if (lapsoActual && lapsoActual.id !== formik.values.lapsoId) {
      formik.setFieldValue("lapsoId", lapsoActual.id);
    }
  }, [lapsoActual?.id]); // Solo reaccionar al cambio del ID

  // Actualizar el contexto cuando el usuario cambia el select
  useEffect(() => {
    if (formik.values.lapsoId && formik.values.lapsoId !== lapsoActual?.id) {
      const selected = lapsos.find((l) => l.id == formik.values.lapsoId);
      if (selected) {
        setLapsoActual(selected);
      }
    }
  }, [formik.values.lapsoId, lapsos, setLapsoActual]);

  return (
    <div className="w-48">
      <SelectSearch
        name="lapsoId"
        options={lapsos || []}
        formik={formik}
        valueKey="id"
        labelKey="nombre_lapso"
        placeholder="Seleccione lapso..."
        div_style="w-full"
      />
    </div>
  );
}
