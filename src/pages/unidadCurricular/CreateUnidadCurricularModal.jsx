import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { createUnidadCurricular, getTrimestresByTrayecto } from "@/services/unidadCurricularService";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { ModernInput } from "@/components/shared/InputModerno";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import SelectSearch from "@/components/shared/SelectSearch";
import { ModernTextarea } from "@/components/shared/ModernTextarea";
import Api from "@/services/api";
import { useUpperCase } from "@/hooks/useUpperCase";

export default function CreateUnidadCurricularModal({
  fetchUnidades,
  trayectos,
}) {
  const [openModal, setOpenModal] = useState(false);
  const [trimestres, setTrimestres] = useState([]);
  const [loadingTrimestres, setLoadingTrimestres] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        nombre: Yup.string()
          .matches(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/, "Solo letras permitidas")
          .required("Este campo es obligatorio"),
        unidad_credito: Yup.string()
          .matches(/^[0-9]+$/, "Solo se permiten números")
          .test("min-value", "Debe tener al menos 1 unidad de crédito", (val) => !val || Number(val) >= 1)
          .required("Este campo es obligatorio"),
        hora_practica: Yup.string()
          .nullable()
          .matches(/^[0-9]*$/, "Solo números")
          .test("min-value", "Debe tener al menos 1 hora práctica", (val) => !val || Number(val) >= 1),
        hora_teorica: Yup.string()
          .matches(/^[0-9]+$/, "Solo se permiten números")
          .test("min-value", "Debe tener al menos 1 hora teórica", (val) => !val || Number(val) >= 1)
          .required("Este campo es obligatorio"),
        periodo: Yup.string().required("Este campo es obligatorio"),
        trayecto_id: Yup.string().required("Este campo es obligatorio"),
        descripcion: Yup.string().optional(),
        // Primero definir una validación base
        trimestre_id: Yup.mixed().test(
          "trimestre-validation",
          function (value) {
            const { periodo } = this.parent;

            // Si no hay período seleccionado, no validar
            if (!periodo) return true;

            if (periodo === "1") {
              // TRIMESTRAL
              // Debe ser un número (no array)
              if (value === null || value === undefined || value === "") {
                return this.createError({
                  message: "Este campo es obligatorio",
                });
              }
              return true;
            } else if (periodo === "2" || periodo === "3") {
              // SEMESTRAL o ANUAL
              // Debe ser un array con al menos un elemento
              if (!Array.isArray(value) || value.length === 0) {
                return this.createError({
                  message: "Este campo es obligatorio",
                });
              }

              // Validación adicional para SEMESTRAL (exactamente 2 trimestres)
              if (periodo === "2" && value.length !== 2) {
                return this.createError({
                  message:
                    "Debe seleccionar exactamente 2 trimestres para período semestral",
                });
              }

              return true;
            }

            return true;
          },
        ),
      }),
    [],
  );

  const formik = useFormik({
    initialValues: {
      nombre: "",
      unidad_credito: "",
      hora_practica: "",
      hora_teorica: "",
      hora_total_est: "",
      periodo: "",
      trayecto_id: "",
      trimestre_id: "",
      descripcion: "",
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,

    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const response = await createUnidadCurricular(values);
        const menssageSuccess = response?.message || response?.data?.message || "Unidad Curricular creada con éxito";
        notify.success(menssageSuccess);
        fetchUnidades();
        setOpenModal(false);
        resetForm();        
      } catch (error) {
        if (error.response && error.response.status === 422) {
          const laravelErrors = error.response.data.errors;
          const formikErrors = {};
          Object.keys(laravelErrors).forEach((key) => {
            formikErrors[key] = laravelErrors[key][0];
          });
          setErrors(formikErrors);
        } else {
          console.error("Error al crear la unidad curricular:", error);
          notify.error("Error al crear la unidad curricular.");
        }
      }
    },
  });

  useEffect(() => {
    if (!openModal) {
      formik.resetForm();
    }
  }, [openModal]);

  // Cálculo de horas totales
  useEffect(() => {
    const ha = Number(formik.values.hora_practica) || 0;
    const ht = Number(formik.values.hora_teorica) || 0;
    const total = ha + ht;
    if (formik.values.hora_total_est !== total) {
      formik.setFieldValue("hora_total_est", total);
    }
  }, [formik.values.hora_practica, formik.values.hora_teorica]);

  // Función para cargar trimestres basados en el trayecto seleccionado
  const cargarTrimestres = async (trayectoId) => {
    if (!trayectoId) {
      setTrimestres([]);
      return;
    }

    setLoadingTrimestres(true);
    try {
      const response = await getTrimestresByTrayecto(trayectoId);
      setTrimestres(response);
    } catch (error) {
      console.error("Error al cargar trimestres:", error);
      setTrimestres([]);
    } finally {
      setLoadingTrimestres(false);
    }
  };

  // Efecto para cargar trimestres cuando cambia el trayecto seleccionado
  useEffect(() => {
    if (formik.values.trayecto_id) {
      cargarTrimestres(formik.values.trayecto_id);
    } else {
      setTrimestres([]);
      formik.setFieldValue("trimestre_id", "");
    }
  }, [formik.values.trayecto_id]);

  // Determinar el modo de selección de trimestres según el periodo
  const periodoSeleccionado = String(formik.values.periodo);
  const isTrimestreMulti =
    periodoSeleccionado === "2" || periodoSeleccionado === "3"; // 2=SEMESTRAL, 3=ANUAL
  const isTrimestreDisabled = periodoSeleccionado === "3"; // ANUAL

  // Efecto para seleccionar automáticamente los trimestres en modo ANUAL
  useEffect(() => {
    if (periodoSeleccionado === "3" && trimestres.length > 0) {
      // Selecciona todos los trimestres
      formik.setFieldValue(
        "trimestre_id",
        trimestres.map((t) => t.id),
      );
    } else if (periodoSeleccionado === "2" && trimestres.length > 0) {
      // Si cambia a semestral, limpia la selección
      if (
        Array.isArray(formik.values.trimestre_id) &&
        formik.values.trimestre_id.length > 2
      ) {
        formik.setFieldValue("trimestre_id", []);
      }
    } else if (periodoSeleccionado === "1") {
      // Si cambia a trimestral, limpia la selección
      formik.setFieldValue("trimestre_id", "");
    }
  }, [periodoSeleccionado, trimestres]);

  // Inicializar el hook de mayúsculas
  const { handleUpperCaseChange } = useUpperCase(formik);

  return (
    <ModalFormulario
      title="Nueva Unidad Curricular"
      description="Crear una nueva Unidad Curricular"
      TextButton="Nueva UC"
      icon={<PlusIcon />}
      onSubmit={formik.handleSubmit}
      open={openModal}
      onOpenChange={setOpenModal}
      loading={formik.isSubmitting}
      className="max-w-2xl"
    >
      {/* Nombre */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="nombre">Nombre</Label>
        <ModernInput
          id="nombre"
          name="nombre"
          type="text"
          placeholder="EJ: MATEMÁTICAS I"
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.nombre}
        />
        {formik.errors.nombre && formik.touched.nombre && (
          <p className="text-xs font-medium text-red-500">
            {formik.errors.nombre}
          </p>
        )}
      </div>

      {/* Trayectos */}
      <div className="md:col-span-4 space-y-1 flex flex-col">
        <Label htmlFor="trayecto_id">Trayectos</Label>
        <SelectSearch
          name="trayecto_id"
          options={trayectos}
          formik={formik}
          isMulti={false}
          labelKey="nombre"
          valueKey="id"
          placeholder="Seleccione un trayecto"
        />
        {formik.touched.trayecto_id && formik.errors.trayecto_id && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.trayecto_id}
          </p>
        )}
      </div>

      {/* Periodo */}
      <div className="md:col-span-4 space-y-1 flex flex-col">
        <Label htmlFor="periodo">Periodo</Label>
        <SelectSearch
          name="periodo"
          options={[
            { id: "1", nombre: "TRIMESTRAL" },
            { id: "2", nombre: "SEMESTRAL" },
            { id: "3", nombre: "ANUAL" },
          ]}
          formik={formik}
          placeholder="Seleccione un periodo"
        />
        {formik.errors.periodo && formik.touched.periodo && (
          <p className="text-xs font-medium text-red-500">
            {formik.errors.periodo}
          </p>
        )}
      </div>

      {/* Trimestres */}
      <div className="md:col-span-4 space-y-1 flex flex-col">
        <Label htmlFor="trimestre_id">Trimestres</Label>
        <SelectSearch
          name="trimestre_id"
          options={trimestres}
          formik={formik}
          isMulti={isTrimestreMulti}
          disabled={
            !formik.values.trayecto_id ||
            loadingTrimestres ||
            isTrimestreDisabled
          }
          placeholder={
            !formik.values.trayecto_id
              ? "Primero seleccione un trayecto"
              : loadingTrimestres
                ? "Cargando trimestres..."
                : isTrimestreDisabled
                  ? "Seleccionados automáticamente"
                  : isTrimestreMulti
                    ? "Seleccione 2 trimestres"
                    : "Seleccione un trimestre"
          }
          labelKey="nombre"
          valueKey="id"
        />
        {formik.touched.trimestre_id && formik.errors.trimestre_id && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.trimestre_id}
          </p>
        )}
      </div>

      {/* Unidad de Crédito */}
      <div className="md:col-span-3 space-y-1 flex flex-col">
        <Label htmlFor="unidad_credito">Unidad de Crédito</Label>
        <ModernInput
          id="unidad_credito"
          name="unidad_credito"
          type="text"
          placeholder="EJ: 3"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.unidad_credito}
        />
        {formik.errors.unidad_credito && formik.touched.unidad_credito && (
          <p className="text-xs font-medium text-red-500">
            {formik.errors.unidad_credito}
          </p>
        )}
      </div>

      {/* Horas Teóricas */}
      <div className="md:col-span-3 space-y-1 flex flex-col">
        <Label htmlFor="hora_teorica">Horas Teóricas</Label>
        <ModernInput
          id="hora_teorica"
          name="hora_teorica"
          type="text"
          placeholder="EJ: 20"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.hora_teorica}
        />
        {formik.errors.hora_teorica && formik.touched.hora_teorica && (
          <p className="text-xs font-medium text-red-500">
            {formik.errors.hora_teorica}
          </p>
        )}
      </div>

      {/* Horas Académicas */}
      <div className="md:col-span-3 space-y-1 flex flex-col">
        <Label htmlFor="hora_practica">Horas Prácticas</Label>
        <ModernInput
          id="hora_practica"
          name="hora_practica"
          type="text"
          placeholder="EJ: 40"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.hora_practica}
        />
        {formik.errors.hora_practica && formik.touched.hora_practica && (
          <p className="text-xs font-medium text-red-500">
            {formik.errors.hora_practica}
          </p>
        )}
      </div>

      {/* Horas Tota estimadas */}
      <div className="md:col-span-3 space-y-1 flex flex-col">
        <Label htmlFor="hora_total_est">Horas Totales</Label>
        <ModernInput
          id="hora_total_est"
          name="hora_total_est"
          type="text"
          value={formik.values.hora_total_est}
          disabled
          className="bg-gray-100 cursor-not-allowed dark:bg-gray-800"
        />
      </div>

      {/* Descripción */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="descripcion">Descripción</Label>
        <ModernTextarea
          id="descripcion"
          name="descripcion"
          placeholder="DESCRIPCIÓN DE LA UNIDAD CURRICULAR"
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.descripcion}
        />
        {formik.errors.descripcion && formik.touched.descripcion && (
          <p className="text-xs font-medium text-red-500">
            {formik.errors.descripcion}
          </p>
        )}
      </div>
    </ModalFormulario>
  );
}
