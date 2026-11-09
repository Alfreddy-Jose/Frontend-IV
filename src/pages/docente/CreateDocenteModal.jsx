import React, { useMemo, useState, useEffect } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import SelectSearch from "@/components/shared/SelectSearch";
import { createDocente } from "@/services/docenteService";
import { DateField } from "@/components/shared/DateField";
import { getUnidadesCurricularesByPnf } from "@/services/unidadCurricularService";
import { useAuth } from "@/context/AuthContext";

export default function CreateDocenteModal({ fetchDocente, dataSelect }) {
  const [openModal, setOpenModal] = useState(false);

  // Estado local para almacenar las UCs filtradas por el PNF seleccionado
  const [unidadesCurricularesOptions, setUnidadesCurricularesOptions] = useState([]);
  const [loadingUC, setLoadingUC] = useState(false);

  // obtener pnf del usuario logueado
  const { pnf } = useAuth();

  const validationSchema = useMemo(
    () =>
      Yup.object({
        persona_id: Yup.number().required("Este campo es obligatorio"),
        pnf_id: Yup.number().required("Este campo es obligatorio"),
        categoria: Yup.string().required("Este campo es obligatorio"),
        dedicacion: Yup.string().required("Este campo es obligatorio"),
        tipo: Yup.string().required("Este campo es obligatorio"),
        unidad_curricular_id: Yup.array()
          .min(1, "Debe seleccionar al menos una unidad curricular")
          .required("Este campo es obligatorio"),
        fecha_inicio: Yup.date()
          .transform((value, originalValue) =>
            originalValue === "" || originalValue == null ? null : value,
          )
          .required("Este campo es obligatorio")
          .typeError("Fecha no válida"),
        fecha_fin: Yup.date()
          .transform((value, originalValue) =>
            originalValue === "" || originalValue == null ? null : value,
          )
          .required("Este campo es obligatorio")
          .typeError("Fecha no válida")
          .test(
            "after-fecha-inicio",
            "La fecha de fin debe ser posterior a la fecha de inicio",
            function (value) {
              const { fecha_inicio } = this.parent;
              if (!value || !fecha_inicio) return true;

              const inicio = new Date(fecha_inicio);
              const fin = new Date(value);
              if (
                Number.isNaN(inicio.getTime()) ||
                Number.isNaN(fin.getTime())
              ) {
                return true;
              }
              return fin > inicio;
            },
          ),
      }),
    [],
  );

  const formik = useFormik({
    initialValues: {
      persona_id: "",
      pnf_id: pnf || "",
      categoria: "",
      fecha_inicio: "",
      fecha_fin: "",
      dedicacion: "",
      tipo: "",
      unidad_curricular_id: [],
    },
    enableReinitialize: true,
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,

    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const formatDate = (dateObj) => {
          if (!dateObj) return null;
          try {
            return new Date(dateObj).toISOString().split("T")[0];
          } catch (e) {
            return dateObj;
          }
        };

        const formattedValues = {
          ...values,
          fecha_inicio: formatDate(values.fecha_inicio),
          fecha_fin: formatDate(values.fecha_fin),
        };

        formattedValues.horas_dedicacion =
          formattedValues.dedicacion === "TIEMPO COMPLETO" ? 18 : 12;

        const response = await createDocente(formattedValues);
        const menssageSuccess =
          response?.message ||
          response?.data?.message ||
          "Docente creado con éxito";

        notify.success(menssageSuccess);
        fetchDocente();
        setOpenModal(false);
        resetForm();
        setUnidadesCurricularesOptions([]); // Resetear la lista al cerrar
      } catch (error) {
        if (error.response && error.response.status === 422) {
          const laravelErrors = error.response.data.errors;
          const formikErrors = {};

          Object.keys(laravelErrors).forEach((key) => {
            formikErrors[key] = laravelErrors[key][0];
          });

          setErrors(formikErrors);
        } else {
          console.error("Error al crear el docente:", error);
          notify.error("Error al crear el docente.");
        }
      }
    },
  });

  // EFECTO DE CASCADA / SELECT DEPENDIENTE
  useEffect(() => {
    // 1. SI EL MODAL ESTÁ CERRADO, NO HACER NADA EN ABSOLUTO
    if (!openModal) return;

    const currentPnfId = formik.values.pnf_id;

    // 2. VALIDAR ESTRICTAMENTE: debe ser un entero positivo válido
    const parsedId = parseInt(currentPnfId, 10);
    const isValidPnf =
      currentPnfId &&
      currentPnfId !== "null" &&
      !isNaN(parsedId) &&
      parsedId > 0;

    if (isValidPnf) {
      setLoadingUC(true);

      // Limpiar unidades seleccionadas previamente
      formik.setFieldValue("unidad_curricular_id", []);

      getUnidadesCurricularesByPnf(parsedId)
        .then((data) => {
          const unidades = Array.isArray(data) ? data : data?.data || [];
          setUnidadesCurricularesOptions(unidades);
        })
        .catch((err) => {
          console.error("Error al cargar unidades curriculares:", err);
          notify.error("No se pudieron cargar las unidades curriculares.");
          setUnidadesCurricularesOptions([]);
        })
        .finally(() => {
          setLoadingUC(false);
        });
    } else {
      setUnidadesCurricularesOptions([]);
      formik.setFieldValue("unidad_curricular_id", []);
    }
  }, [formik.values.pnf_id, openModal]);

  return (
    <ModalFormulario
      title="Nuevo Docente"
      description="Crear un nuevo Docente"
      TextButton="Nuevo Docente"
      icon={<PlusIcon />}
      onSubmit={formik.handleSubmit}
      open={openModal}
      onOpenChange={(status) => {
        setOpenModal(status);
        if (!status) {
          formik.resetForm();
          setUnidadesCurricularesOptions([]);
        }
      }}
      loading={formik.isSubmitting}
    >
      {/* Select para buscar Docente */}
      <div className="md:col-span-5 space-y-1 flex flex-col">
        <Label htmlFor="persona_id">Buscar Docente</Label>
        <SelectSearch
          name="persona_id"
          options={dataSelect.docentes}
          formik={formik}
          valueKey="id"
          labelKey="nombre"
          placeholder="Buscar docente"
        />
        {formik.touched.persona_id && formik.errors.persona_id && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.persona_id}
          </p>
        )}
      </div>

      {/* Select para PNF */}
      <div className="md:col-span-7 space-y-1 flex flex-col">
        <Label htmlFor="pnf_id">PNF</Label>
        <SelectSearch
          name="pnf_id"
          options={dataSelect.pnf}
          formik={formik}
          valueKey="id"
          labelKey="nombre"
          disabled={Boolean(pnf)}
          placeholder="Seleccionar PNF"
        />
        {formik.touched.pnf_id && formik.errors.pnf_id && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.pnf_id}
          </p>
        )}
      </div>

      {/* Input de la fecha de inicio */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <DateField
          id="fecha_inicio"
          name="fecha_inicio"
          label="Fecha de Inicio"
          value={formik.values.fecha_inicio}
          onChange={formik.handleChange}
          error={formik.errors.fecha_inicio}
          touched={formik.touched.fecha_inicio}
        />
      </div>

      {/* Input de la fecha de fin */}
      <div className="md:col-span-6 space-y-1 flex flex-col">
        <DateField
          id="fecha_fin"
          name="fecha_fin"
          label="Fecha de Fin"
          value={formik.values.fecha_fin}
          onChange={formik.handleChange}
          error={formik.errors.fecha_fin}
          touched={formik.touched.fecha_fin}
          min={formik.values.fecha_inicio || undefined}
        />
      </div>

      {/* Select para Dedicación */}
      <div className="md:col-span-4 space-y-1 flex flex-col">
        <Label htmlFor="dedicacion">Dedicación</Label>
        <SelectSearch
          name="dedicacion"
          options={[
            { id: 1, nombre: "TIEMPO COMPLETO" },
            { id: 2, nombre: "MEDIO TIEMPO" },
          ]}
          formik={formik}
          valueKey="nombre"
          labelKey="nombre"
          placeholder="Seleccione una opción"
        />
        {formik.touched.dedicacion && formik.errors.dedicacion && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.dedicacion}
          </p>
        )}
      </div>

      {/* Select para Categoría */}
      <div className="md:col-span-4 space-y-1 flex flex-col">
        <Label htmlFor="categoria">Categoría</Label>
        <SelectSearch
          name="categoria"
          options={[
            { id: 1, nombre: "ASISTENTE" },
            { id: 2, nombre: "INSTRUCTOR" },
          ]}
          formik={formik}
          valueKey="nombre"
          labelKey="nombre"
          placeholder="Seleccione una opción"
        />
        {formik.touched.categoria && formik.errors.categoria && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.categoria}
          </p>
        )}
      </div>

      {/* Select para Tipo */}
      <div className="md:col-span-4 space-y-1 flex flex-col">
        <Label htmlFor="tipo">Tipo</Label>
        <SelectSearch
          name="tipo"
          options={[
            { id: 1, nombre: "FIJO" },
            { id: 2, nombre: "CONTRATADO" },
          ]}
          formik={formik}
          valueKey="nombre"
          labelKey="nombre"
          placeholder="Seleccione una opción"
        />
        {formik.touched.tipo && formik.errors.tipo && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.tipo}
          </p>
        )}
      </div>

      {/* Select dependiente para Unidad Curricular */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="unidad_curricular_id">Unidad Curricular</Label>
        <SelectSearch
          name="unidad_curricular_id"
          options={unidadesCurricularesOptions}
          isMulti={true}
          formik={formik}
          valueKey="id"
          labelKey="nombre"
          isDisabled={!formik.values.pnf_id || loadingUC}
          placeholder={
            loadingUC
              ? "Cargando unidades..."
              : !formik.values.pnf_id
                ? "Seleccione un PNF primero"
                : "Seleccione una o más opciones"
          }
        />
        {formik.touched.unidad_curricular_id &&
          formik.errors.unidad_curricular_id && (
            <p className="text-xs text-red-500 font-medium">
              {formik.errors.unidad_curricular_id}
            </p>
          )}
      </div>
    </ModalFormulario>
  );
}