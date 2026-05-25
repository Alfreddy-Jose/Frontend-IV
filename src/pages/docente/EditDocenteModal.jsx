import React, { useState, useEffect, useMemo } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { getDocenteById, updateDocente } from "@/services/docenteService";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { Label } from "@/components/ui/label";
import SelectSearch from "@/components/shared/SelectSearch";
import { DateField } from "@/components/shared/DateField";

export default function EditDocenteModal({ isOpen, onClose, docenteId, onSuccess, dataSelect }) {
    const [editingDocente, setEditingDocente] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingDocente, setLoadingDocente] = useState(false);

    const validationSchema = useMemo(
        () =>
            Yup.object({
                persona_id: Yup.number().required("Este campo es obligatorio"),
                pnf_id: Yup.number().required("Este campo es obligatorio"),
                categoria: Yup.string().required("Este campo es obligatorio"),
                dedicacion: Yup.string().required("Este campo es obligatorio"),
                tipo: Yup.string().required("Este campo es obligatorio"),
                unidad_curricular_id: Yup.array().required("Este campo es obligatorio"),
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

    const getUnidadesCurricularesIds = (docenteData) =>
        docenteData?.unidades_curriculares?.map((uc) => uc.unidad_curricular_id ?? uc.id) || [];

    const formik = useFormik({
        initialValues: {
            persona_id: editingDocente?.persona_id || "",
            pnf_id: editingDocente?.pnf_id || "",
            categoria: editingDocente?.categoria || "",
            fecha_inicio: editingDocente?.condicion_contrato?.fecha_inicio || "",
            fecha_fin: editingDocente?.condicion_contrato?.fecha_fin || "",
            dedicacion: editingDocente?.condicion_contrato?.dedicacion || "",
            tipo: editingDocente?.condicion_contrato?.tipo || "",  
            unidad_curricular_id: getUnidadesCurricularesIds(editingDocente),
        },
        validationSchema,
        enableReinitialize: true,
        validateOnBlur: true,
        validateOnChange: true,
        onSubmit: async (values, { setErrors }) => {
            setLoading(true);
            try {
                // Prevenir desfase de zonas horarias extrayendo YYYY-MM-DD
                const formatDate = (dateObj) => {
                    if (!dateObj) return null;
                    try {
                        return new Date(dateObj).toISOString().split('T')[0];
                    } catch (e) {
                        return dateObj;
                    }
                };

                const formattedValues = {
                    ...values,
                    fecha_inicio: formatDate(values.fecha_inicio),
                    fecha_fin: formatDate(values.fecha_fin),
                };

                formattedValues.horas_dedicacion = formattedValues.dedicacion === "TIEMPO COMPLETO" ? 18 : 12;
                const response = await updateDocente(editingDocente.id, formattedValues);
                const menssageSuccess = response?.message || response?.data?.message || "Docente actualizado con éxito";
                notify.success(menssageSuccess);
                onSuccess();
                onClose();
                formik.resetForm();
                setEditingDocente(null);
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    const laravelErrors = error.response.data.errors;
                    const formikErrors = {};

                    Object.keys(laravelErrors).forEach((key) => {
                        formikErrors[key] = laravelErrors[key][0];
                    });

                    setErrors(formikErrors);
                } else {
                    console.error("Error al editar el docente:", error);
                    notify.error("Error al editar el docente.");
                }
            } finally {
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        if (isOpen && docenteId) {
            const fetchDocente = async () => {
                setLoadingDocente(true);
                try {
                    const docenteData = await getDocenteById(docenteId);
                    setEditingDocente({
                        ...docenteData,
                        unidad_curricular_id: getUnidadesCurricularesIds(docenteData),
                    });
                } catch (error) {
                    console.error("Error fetching docente:", error);
                    notify.error("Error al cargar los datos del Docente");
                    onClose();
                } finally {
                    setLoadingDocente(false);
                }
            };
            fetchDocente();
        } else {
            setEditingDocente(null);
            formik.resetForm();
        }
    }, [isOpen, docenteId]);

    return (
        <ModalFormulario
            button={false}
            title="Editar Docente"
            description="Editar un docente existente"
            loadingCargar={loadingDocente}
            loading={loading}
            onSubmit={formik.handleSubmit}
            open={isOpen}
            onOpenChange={onClose}
        >
            {/* Select para buscar Docente */}
            <div className="md:col-span-4 space-y-1 flex flex-col">
                <Label htmlFor="persona_id">Buscar Docente</Label>
                <SelectSearch
                    name="persona_id"
                    options={dataSelect?.docentesEdit}
                    formik={formik}
                    valueKey="id"
                    labelKey="nombre"
                    placeholder="Buscar docente"
                    disabled={true}
                />
                {formik.touched.persona_id && formik.errors.persona_id && (
                    <p className="text-xs text-red-500 font-medium">
                        {formik.errors.persona_id}
                    </p>
                )}
            </div>

            {/* Select para PNF */}
            <div className="md:col-span-8 space-y-1 flex flex-col">
                <Label htmlFor="pnf_id">PNF</Label>
                <SelectSearch
                    name="pnf_id"
                    options={dataSelect?.pnf || []}
                    formik={formik}
                    valueKey="id"
                    labelKey="nombre"
                    placeholder="Seleccione una opción"
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

            {/* Select para Unidad Curricular */}
            <div className="md:col-span-12 space-y-1 flex flex-col">
                <Label htmlFor="unidad_curricular_id">Unidad Curricular</Label>
                <SelectSearch
                    name="unidad_curricular_id"
                    options={dataSelect?.unidadesCurriculares || []}
                    isMulti={true}
                    formik={formik}
                    placeholder="Seleccione una o +opciones"
                />
                {formik.touched.unidad_curricular_id && formik.errors.unidad_curricular_id && (
                    <p className="text-xs text-red-500 font-medium">
                        {formik.errors.unidad_curricular_id}
                    </p>
                )}
            </div>
        </ModalFormulario>
    );
}
