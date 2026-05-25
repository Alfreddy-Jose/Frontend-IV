// CreateCoordinadorModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import SelectSearch from "@/components/shared/SelectSearch";
import { DateField } from "@/components/shared/DateField";
import { createCoordinador } from "@/services/coordinadorService";
import { ModernInput } from "@/components/shared/InputModerno";

/**
 * Modal para crear un nuevo Coordinador.
 * @param {{ fetchCoordinadores: () => void, dataSelect: { docentes: any[] } }} props
 */
export default function CreateCoordinadorModal({
  fetchCoordinadores,
  dataSelect,
}) {
  const [openModal, setOpenModal] = useState(false);


  // -----------------------------------------------------------------
  //  Formik validation schema (copiado de CoordinadorCreate.jsx)
  // -----------------------------------------------------------------
  const validationSchema = useMemo(
    () =>
      Yup.object({
        docente_id: Yup.string().required("Este campo es obligatorio"),
        fecha_inicio: Yup.date()
          .required("Este campo es obligatorio")
          .typeError("Fecha no válida"),
      }),
    [],
  );

  const formik = useFormik({
    initialValues: {
      docente_id: "",
      fecha_inicio: "",
      pnf_id: "",
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        // Formatear fecha a YYYY‑MM‑DD para evitar problemas de zona horaria
        const formatDate = (date) => {
          if (!date) return "";
          const d = new Date(date);
          return isNaN(d) ? date : d.toISOString().split("T")[0];
        };

        const payload = {
          docente_id: values.docente_id,
          fecha_inicio: formatDate(values.fecha_inicio),
          pnf_id: values.pnf_id,
        };
        await createCoordinador(payload);
        // Disparamos el evento para que el NotificationBell sepa que debe recargar
        window.dispatchEvent(new Event('coordinadorCreado'));
        notify.success("Coordinador registrado con éxito");
        resetForm();
        setOpenModal(false);
        fetchCoordinadores();
      } catch (error) {
        // Errores de validación de Laravel (422)
        if (error.response && error.response.status === 422) {
          const laravelErrors = error.response.data.errors || {};
          const formikErrors = {};
          Object.keys(laravelErrors).forEach((key) => {
            formikErrors[key] = laravelErrors[key][0];
          });
          setErrors(formikErrors);
        } else {
          console.error("Error al crear coordinador:", error);
          notify.error("Error al crear coordinador.");
        }
      }
    },
  });

  const { values, handleChange, handleBlur, touched, errors, isSubmitting, setFieldValue } = formik;

  useEffect(() => {
    if (values.docente_id && dataSelect.docentes) {
      const selectedDocente = dataSelect.docentes.find(
        (d) => d.id == values.docente_id,
      );

      if (selectedDocente && values.pnf_id !== selectedDocente.id_pnf) {
        setFieldValue("pnf_id", selectedDocente.id_pnf);
      }
    }
  }, [values.docente_id, values.pnf_id, dataSelect.docentes, setFieldValue]);


  useEffect(() => {
    if (!openModal) {
      formik.resetForm();
    }
  }, [openModal]);

  return (
    <ModalFormulario
      title="Registrar Coordinador"
      description="Crear un nuevo Coordinador"
      TextButton="Nuevo Coordinador"
      icon={<PlusIcon />}
      open={openModal}
      onOpenChange={setOpenModal}
      onSubmit={formik.handleSubmit}
      loading={isSubmitting}
    >
      {/* Docente selector */}
      <div className="md:col-span-6 space-y-1 flex flex-col w-full">
        <Label htmlFor="docente_id">Docente</Label>
        <SelectSearch
          name="docente_id"
          options={dataSelect.docentes || []}
          formik={formik}
          valueKey="id"
          labelKey="nombre"
          placeholder="Buscar docente"
        />
        {touched.docente_id && errors.docente_id && (
          <p className="text-xs text-red-500 font-medium">
            {errors.docente_id}
          </p>
        )}
      </div>

      {/* Fecha de inicio */}
      <div className="md:col-span-6 space-y-1 flex flex-col w-full">
        <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
        <DateField
          id="fecha_inicio"
          name="fecha_inicio"
          value={values.fecha_inicio}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.fecha_inicio}
          touched={touched.fecha_inicio}
        />
      </div>

      {/* Docente selector */}
      <div className="md:col-span-12 space-y-1 flex hidden flex-col">
        <Label htmlFor="pnf_id">PNF</Label>
        <ModernInput
          name="pnf_id"
          type="text"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.pnf_id}
          hidden={true}
          disabled={true}
          readOnly={true}
        />
        {touched.pnf_id && errors.pnf_id && (
          <p className="text-xs text-red-500 font-medium">{errors.pnf_id}</p>
        )}
      </div>
    </ModalFormulario>
  );
}
