import { ModernInput } from "@/components/shared/InputModerno";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { notify } from "@/components/shared/Notify";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createBien } from "@/services/inventarioService";
import { useFormik } from "formik";
import { PlusIcon, CheckCircle2, AlertTriangle, ArchiveX, ImagePlus, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { useUpperCase } from "@/hooks/useUpperCase";
import SelectSearch from "@/components/shared/SelectSearch";

const ESTADOS = [
  {
    value: "operativo",
    label: "Operativo",
    icon: CheckCircle2,
    colorClass:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400",
    activeClass: "ring-2 ring-green-400 dark:ring-green-600",
  },
  {
    value: "dañado",
    label: "Dañado",
    icon: AlertTriangle,
    colorClass:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400",
    activeClass: "ring-2 ring-amber-400 dark:ring-amber-600",
  },
  {
    value: "desincorporado",
    label: "Desincorporado",
    icon: ArchiveX,
    colorClass:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400",
    activeClass: "ring-2 ring-red-400 dark:ring-red-600",
  },
];

export default function CreateBienModal({ fetchInventario, lapsoActual, pnfs, pnfId = null }) {
  const [openModal, setOpenModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Esquema de validación estricto con estado_operativo obligatorio e imagen opcional
  const validationSchema = useMemo(
    () =>
      Yup.object({
        // Se exige el pnf_id solo si NO viene predeterminado por prop pnfId
        pnf_id: pnfId
          ? Yup.mixed().notRequired()
          : Yup.string().required("Este campo es obligatorio"),
        codigo_uni: Yup.string()
          .trim()
          .required("El código de bienes es obligatorio"),
        nombre: Yup.string()
          .trim()
          .required("El nombre del bien es obligatorio"),
        estado_operativo: Yup.string()
          .oneOf(["operativo", "dañado", "desincorporado"], "Selecciona un estado válido")
          .required("El estado operativo es obligatorio"),
        descripcion: Yup.string()
          .trim()
          .nullable(),
        imagen: Yup.mixed()
          .nullable()
          .test(
            "fileSize",
            "La imagen es demasiado grande (Máx 2MB)",
            (value) => !value || (value && value.size <= 2 * 1024 * 1024)
          )
          .test(
            "fileType",
            "Formato de imagen no soportado (JPEG, PNG, WEBP)",
            (value) =>
              !value ||
              (value &&
                ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(value.type))
          ),
      }),
    [pnfId]
  );

  const formik = useFormik({
    initialValues: {
      codigo_uni: "",
      nombre: "",
      estado_operativo: "operativo",
      descripcion: "",
      imagen: null,
      pnf_id: pnfId || "",
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const payload = {
          ...values,
          lapso_academico_id: lapsoActual?.id || null,
        };

        const response = await createBien(payload);
        const successMessage =
          response?.message ||
          response?.data?.message ||
          "Bien registrado con éxito";

        notify.success(successMessage);

        if (fetchInventario) {
          fetchInventario();
        }

        setOpenModal(false);
        setPreviewImage(null);
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
          console.error("Error al registrar el bien:", error);
          notify.error("Error al registrar el bien.");
        }
      }
    },
  });

  useEffect(() => {
    if (!openModal) {
      formik.resetForm();
      setPreviewImage(null);
    }
  }, [openModal]);

  const { handleUpperCaseChange } = useUpperCase(formik);

  // Manejo del cambio de archivo de imagen
  const handleImageChange = (e) => {
    const file = e.currentTarget.files[0];
    if (file) {
      formik.setFieldValue("imagen", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    formik.setFieldValue("imagen", null);
    setPreviewImage(null);
  };

  return (
    <ModalFormulario
      title="Registrar Nuevo Bien"
      description="Registrar la ficha estática de un activo de la coordinación"
      TextButton="Nuevo Bien"
      icon={<PlusIcon className="mr-2 h-4 w-4" />}
      onSubmit={formik.handleSubmit}
      open={openModal}
      onOpenChange={setOpenModal}
      loading={formik.isSubmitting}
      tamaño="sm:max-w-2xl"
    >
      {/* Código Universidad */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="codigo_uni">Código de Bienes (Universidad)</Label>
        <ModernInput
          id="codigo_uni"
          name="codigo_uni"
          placeholder="EJ: C-1029384"
          type="text"
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.codigo_uni}
          className="mb-1"
        />
        {formik.touched.codigo_uni && formik.errors.codigo_uni && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.codigo_uni}
          </p>
        )}
      </div>

      {/* Nombre del Bien */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="nombre">Nombre / Equipo</Label>
        <ModernInput
          id="nombre"
          name="nombre"
          placeholder="EJ: Silla Ejecutiva o Monitor HP 24''"
          type="text"
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.nombre}
          className="mb-1"
        />
        {formik.touched.nombre && formik.errors.nombre && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.nombre}
          </p>
        )}
      </div>

      {/* Select de PNF condicional: Solo si el usuario NO tiene pnfId asociado */}
      {!pnfId && (
        <div className="md:col-span-12 space-y-1 flex flex-col">
          <Label htmlFor="pnf_id">PNF</Label>
          <SelectSearch
            name="pnf_id"
            options={pnfs}
            formik={formik}
            isMulti={false}
            labelKey="nombre"
            valueKey="id"
            placeholder="Seleccione el PNF"
          />
          {formik.touched.pnf_id && formik.errors.pnf_id && (
            <p className="text-xs text-red-500 font-medium">
              {formik.errors.pnf_id}
            </p>
          )}
        </div>
      )}

      {/* Estado Operativo Inicial */}
      <div className="md:col-span-12 space-y-2 flex flex-col">
        <Label>Estado Operativo Inicial</Label>
        <RadioGroup
          value={formik.values.estado_operativo}
          onValueChange={(val) => formik.setFieldValue("estado_operativo", val)}
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {ESTADOS.map(({ value, label, icon: Icon, colorClass, activeClass }) => (
            <label
              key={value}
              htmlFor={`create-estado-${value}`}
              className={`flex items-center gap-2.5 cursor-pointer rounded-xl border px-3 py-2.5 transition-all text-sm font-medium select-none ${colorClass} ${
                formik.values.estado_operativo === value
                  ? activeClass
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <RadioGroupItem
                id={`create-estado-${value}`}
                value={value}
                className="shrink-0"
              />
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </label>
          ))}
        </RadioGroup>
        {formik.touched.estado_operativo && formik.errors.estado_operativo && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.estado_operativo}
          </p>
        )}
      </div>

      {/* Carga de Fotografía del Bien */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="imagen">
          Foto del Estado del Bien{" "}
          <span className="text-xs text-slate-400 font-normal">(Opcional)</span>
        </Label>

        {previewImage ? (
          <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
            <img
              src={previewImage}
              alt="Vista previa del bien"
              className="object-contain h-full w-full"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="imagen"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImagePlus className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Haz clic para subir una foto <span className="text-slate-400">(Max 2MB)</span>
              </p>
            </div>
            <input
              id="imagen"
              name="imagen"
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
        {formik.touched.imagen && formik.errors.imagen && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.imagen}
          </p>
        )}
      </div>

      {/* Descripción / Características */}
      <div className="md:col-span-12 space-y-1 flex flex-col">
        <Label htmlFor="descripcion">
          Descripción / Detalle Técnico{" "}
          <span className="text-xs text-slate-400 font-normal">(Opcional)</span>
        </Label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          placeholder="Escriba especificaciones técnicas o detalles del bien..."
          onChange={handleUpperCaseChange}
          onBlur={formik.handleBlur}
          value={formik.values.descripcion}
          className="w-full p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl outline-none border border-transparent focus:border-indigo-500 transition-all text-sm resize-none"
        />
        {formik.touched.descripcion && formik.errors.descripcion && (
          <p className="text-xs text-red-500 font-medium">
            {formik.errors.descripcion}
          </p>
        )}
      </div>
    </ModalFormulario>
  );
}