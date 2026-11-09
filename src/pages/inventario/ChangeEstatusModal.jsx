import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { ModernTextarea } from "@/components/shared/ModernTextarea";
import { notify } from "@/components/shared/Notify";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { guardarReporteEstatus } from "@/services/inventarioService";
import { CheckCircle2, AlertTriangle, ArchiveX, Image as ImageIcon, Upload } from "lucide-react";
import { useUpperCase } from "@/hooks/useUpperCase";

const ESTADOS = [
    {
        value: "operativo",
        label: "Operativo",
        icon: CheckCircle2,
        colorClass: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400",
        activeClass: "ring-2 ring-green-400 dark:ring-green-600",
    },
    {
        value: "dañado",
        label: "Dañado",
        icon: AlertTriangle,
        colorClass: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400",
        activeClass: "ring-2 ring-amber-400 dark:ring-amber-600",
    },
    {
        value: "desincorporado",
        label: "Desincorporado",
        icon: ArchiveX,
        colorClass: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400",
        activeClass: "ring-2 ring-red-400 dark:ring-red-600",
    },
];

// Tipos de formato soportados y tamaño máximo (2MB)
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
const FILE_SIZE_LIMIT = 2 * 1024 * 1024; // 2MB

const validationSchema = Yup.object({
    estado_operativo: Yup.string()
        .oneOf(["operativo", "dañado", "desincorporado"], "Selecciona un estado válido")
        .required("El estado operativo es obligatorio"),
    observaciones: Yup.string().trim().nullable(),
    imagen: Yup.mixed()
        .nullable()
        .test("fileType", "Formato inválido. Solo se admiten archivos PNG, JPG, JPEG o WEBP", (value) => {
            if (!value) return true; // Es opcional
            return value instanceof File && SUPPORTED_FORMATS.includes(value.type);
        })
        .test("fileSize", "La imagen es demasiado pesada (Máximo 2MB)", (value) => {
            if (!value) return true; // Es opcional
            return value instanceof File && value.size <= FILE_SIZE_LIMIT;
        }),
});

export default function ChangeEstatusModal({
    isOpen,
    onClose,
    bien,
    lapsoActual,
    onSuccess,
}) {
    const estadoActual =
        bien?.estado_operativo ||
        bien?.ultimo_reporte?.estado_operativo ||
        "operativo";

    const formik = useFormik({
        initialValues: {
            estado_operativo: estadoActual,
            observaciones: "",
            imagen: null,
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values, { resetForm }) => {
            const bienId = bien?.id || bien?.bien_id;
            if (!bienId) {
                notify.error("No se pudo identificar el bien.");
                return;
            }
            if (!lapsoActual?.id) {
                notify.error("Se requiere un lapso académico activo.");
                return;
            }

            try {
                const formData = new FormData();
                formData.append("bien_id", bienId);
                formData.append("lapso_academico_id", lapsoActual.id);
                formData.append("estado_operativo", values.estado_operativo);
                formData.append("fecha", new Date().toISOString().split("T")[0]);

                if (values.observaciones) {
                    formData.append("observaciones", values.observaciones);
                }

                if (values.imagen instanceof File) {
                    formData.append("imagen", values.imagen);
                }

                const response = await guardarReporteEstatus(formData);
                const msg = response?.message || "Estado actualizado con éxito.";
                notify.success(msg);

                resetForm();
                onClose();
                if (onSuccess) onSuccess();
            } catch (error) {
                console.error("Error al guardar el reporte de estatus:", error);
                
                // Si el backend (Laravel 422) responde con errores de validación específicos
                if (error?.response?.status === 422 && error?.response?.data?.errors) {
                    const serverErrors = error.response.data.errors;
                    if (serverErrors.imagen) {
                        formik.setFieldError("imagen", serverErrors.imagen[0]);
                    }
                }

                notify.error(
                    error?.response?.data?.message ||
                    "Error al actualizar el estado del bien."
                );
            }
        },
    });

    useEffect(() => {
        if (!isOpen) {
            formik.resetForm();
        }
    }, [isOpen]);

    const { handleUpperCaseChange } = useUpperCase(formik);

    const bienNombre = bien?.nombre || bien?.bien?.nombre || "Bien seleccionado";
    const currentImageUrl = bien?.imagen_url || bien?.bien?.imagen_url;

    return (
        <ModalFormulario
            title="Cambiar Estado Operativo"
            description={`Actualizar el estado físico de "${bienNombre}" para el lapso ${lapsoActual?.nombre_lapso || "actual"}.`}
            button={false}
            open={isOpen}
            onOpenChange={(open) => { if (!open) onClose(); }}
            onSubmit={formik.handleSubmit}
            loading={formik.isSubmitting}
        >
            {/* Selector de Estado */}
            <div className="md:col-span-12 space-y-2 flex flex-col">
                <Label>Estado Operativo</Label>
                <RadioGroup
                    value={formik.values.estado_operativo}
                    onValueChange={(val) =>
                        formik.setFieldValue("estado_operativo", val)
                    }
                    className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                >
                    {ESTADOS.map(({ value, label, icon: Icon, colorClass, activeClass }) => (
                        <label
                            key={value}
                            htmlFor={`estado-${value}`}
                            className={`flex items-center gap-2.5 cursor-pointer rounded-xl border px-3 py-2.5 transition-all text-sm font-medium select-none
                                ${colorClass}
                                ${formik.values.estado_operativo === value ? activeClass : "opacity-70 hover:opacity-100"}
                            `}
                        >
                            <RadioGroupItem
                                id={`estado-${value}`}
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

            {/* Subir/Actualizar Fotografía Opcional con Mensaje de Error */}
            <div className="md:col-span-12 space-y-1 flex flex-col">
                <Label htmlFor="imagen">
                    Fotografía del Bien{" "}
                    <span className="text-xs text-slate-400 font-normal">(Opcional)</span>
                </Label>
                
                <div className="flex items-center gap-4">
                    {/* Vista Previa */}
                    <div className={`w-16 h-16 rounded-xl border bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 transition-colors
                        ${formik.errors.imagen ? 'border-red-500/80 dark:border-red-500/80 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-800'}`}
                    >
                        {formik.values.imagen && !formik.errors.imagen ? (
                            <img
                                src={URL.createObjectURL(formik.values.imagen)}
                                alt="Previsualización"
                                className="w-full h-full object-cover"
                            />
                        ) : currentImageUrl ? (
                            <img
                                src={currentImageUrl}
                                alt="Foto actual"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                        )}
                    </div>

                    {/* Input y Botón */}
                    <div className="flex-1">
                        <input
                            id="imagen"
                            name="imagen"
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.currentTarget.files[0];
                                formik.setFieldTouched("imagen", true);
                                formik.setFieldValue("imagen", file || null);
                            }}
                        />
                        <label
                            htmlFor="imagen"
                            className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors
                                ${formik.errors.imagen ? 'border-red-400 dark:border-red-500 text-red-600 dark:text-red-400' : 'border-slate-200 dark:border-slate-700'}`}
                        >
                            <Upload className="w-3.5 h-3.5" />
                            {formik.values.imagen
                                ? "Cambiar foto seleccionada"
                                : currentImageUrl
                                ? "Reemplazar foto existente"
                                : "Adjuntar foto"}
                        </label>

                        {/* Nombre del archivo seleccionado */}
                        {formik.values.imagen && !formik.errors.imagen && (
                            <p className="text-[11px] text-slate-500 mt-1 truncate">
                                {formik.values.imagen.name}
                            </p>
                        )}

                        {/* MENSAJE DE ERROR DE VALIDACIÓN */}
                        {formik.errors.imagen && (
                            <p className="text-xs text-red-500 font-medium mt-1">
                                {formik.errors.imagen}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Observaciones */}
            <div className="md:col-span-12 space-y-1 flex flex-col">
                <Label htmlFor="observaciones">
                    Observación{" "}
                    <span className="text-xs text-slate-400 font-normal">(Opcional)</span>
                </Label>
                <ModernTextarea
                    id="observaciones"
                    name="observaciones"
                    placeholder="Ej: Pantalla rota, en espera de reparación..."
                    rows={3}
                    onChange={handleUpperCaseChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.observaciones}
                />
                {formik.touched.observaciones && formik.errors.observaciones && (
                    <p className="text-xs text-red-500 font-medium">
                        {formik.errors.observaciones}
                    </p>
                )}
            </div>
        </ModalFormulario>
    );
}