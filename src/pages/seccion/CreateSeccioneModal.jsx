import React, { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createSeccion, getPnfBySede } from "@/services/seccionService";
import { notify } from "@/components/shared/Notify";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import SelectSearch from "@/components/shared/SelectSearch";

export default function CreateSeccioneModal({ fetchSecciones, selectData }) {
    const [openModal, setOpenModal] = useState(false);
    const [pnfs, setPnfs] = useState([]);
    const [loadingPnfs, setLoadingPnfs] = useState(false);

    const validationSchema = useMemo(
        () =>
            Yup.object({
                pnf_id: Yup.string().required("El PNF es obligatorio"),
                trayecto_id: Yup.string().required("El trayecto es obligatorio"),
                lapso_id: Yup.string().required("El lapso es obligatorio"),
                sede_id: Yup.string().required("La sede es obligatoria"),
                matricula_id: Yup.string().required("La matricula es obligatoria"),
            }),
        [],
    );

    // Función para cargar Pnfs
    const cargarPnfs = async (sedeId) => {
        if (!sedeId) {
            setPnfs([]);
            return;
        }

        setLoadingPnfs(true);
        try {
            const response = await getPnfBySede(sedeId);
            setPnfs(response);
        } catch (error) {
            console.error("Error al cargar Pnfs:", error);
            setPnfs([]);
        } finally {
            setLoadingPnfs(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            pnf_id: "",
            trayecto_id: "",
            lapso_id: "",
            sede_id: "",
            matricula_id: "",
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values, { setErrors }) => {
            try {
                await createSeccion(values);
                notify.success("Sección creada exitosamente.");
                fetchSecciones();
                setOpenModal(false);
                formik.resetForm();
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    const laravelErrors = error.response.data.errors;
                    const formikErrors = {};
                    Object.keys(laravelErrors).forEach((key) => {
                        formikErrors[key] = laravelErrors[key][0];
                    });
                    setErrors(formikErrors);
                } else {
                    console.error("Error al crear sección:", error);
                    notify.error(
                        "Error al crear sección por favor intente de nuevo."
                    );
                }
            }
        },
    });

    const { resetForm } = formik;

    useEffect(() => {
        if (!openModal) {
            resetForm();
        }
    }, [openModal, resetForm]);

    // Efecto para cargar Pnfs cuando cambia el sede
    useEffect(() => {
        if (formik.values.sede_id) {
            cargarPnfs(formik.values.sede_id);
        } else {
            setPnfs([]);
            formik.setFieldValue("pnf_id", "");
        }
    }, [formik.values.sede_id]);

    return (
        <ModalFormulario
            title="Nueva Sección"
            description="Crear una nueva Sección"
            TextButton="Nueva Sección"
            icon={<PlusIcon />}
            onSubmit={formik.handleSubmit}
            open={openModal}
            onOpenChange={setOpenModal}
            loading={formik.isSubmitting}
        >
            {/* select de sedes */}
            <div className="md:col-span-6 space-y-1 flex flex-col">
                <Label htmlFor="sede_id">Sede</Label>
                <SelectSearch
                    name="sede_id"
                    options={selectData?.sedes || []}
                    formik={formik}
                    labelKey="nombre_sede"
                    valueKey="id"
                    placeholder="Seleccione una sede"
                />
                {formik.touched.sede_id && formik.errors.sede_id && (
                    <p className="text-xs text-red-500 font-medium">{formik.errors.sede_id}</p>
                )}
            </div>

            {/* Select de pnf */}
            <div className="md:col-span-6 space-y-1 flex flex-col">
                <Label htmlFor="pnf_id">PNF</Label>
                <SelectSearch
                    name="pnf_id"
                    options={pnfs || []}
                    placeholder={
                        !formik.values.sede_id
                            ? "Primero seleccione una sede"
                            : loadingPnfs
                                ? "Cargando PNF..."
                                : pnfs?.length === 0
                                    ? "No hay PNF"
                                    : "Seleccione un PNF"
                    }
                    formik={formik}
                    labelKey="nombre"
                    valueKey="id"
                    value={formik.values.pnf_id || ""}
                    disabled={!formik.values.sede_id || loadingPnfs}
                />
                {formik.touched.pnf_id && formik.errors.pnf_id && (
                    <p className="text-xs text-red-500 font-medium">{formik.errors.pnf_id}</p>
                )}
            </div>

            {/* select de lapsos */}
            <div className="md:col-span-4 space-y-1 flex flex-col">
                <Label htmlFor="lapso_id">Lapso</Label>
                <SelectSearch
                    name="lapso_id"
                    options={selectData?.lapsos || []}
                    formik={formik}
                    labelKey="nombre_lapso"
                    valueKey="id"
                    placeholder="Seleccione un lapso"
                />
                {formik.touched.lapso_id && formik.errors.lapso_id && (
                    <p className="text-xs text-red-500 font-medium">{formik.errors.lapso_id}</p>
                )}
            </div>

            {/* select de trayectos */}
            <div className="md:col-span-4 space-y-1 flex flex-col">
                <Label htmlFor="trayecto_id">Trayecto</Label>
                <SelectSearch
                    name="trayecto_id"
                    options={selectData?.trayectos || []}
                    formik={formik}
                    labelKey="nombre"
                    valueKey="id"
                    placeholder="Seleccione un trayecto"
                />
                {formik.touched.trayecto_id && formik.errors.trayecto_id && (
                    <p className="text-xs text-red-500 font-medium">{formik.errors.trayecto_id}</p>
                )}
            </div>

            {/* select para matricula */}
            <div className="md:col-span-4 space-y-1 flex flex-col">
                <Label htmlFor="matricula_id">Tipo Matrícula</Label>
                <SelectSearch
                    name="matricula_id"
                    options={selectData?.tipo_matricula || []}
                    formik={formik}
                    valueKey="id"
                    placeholder="Seleccione un tipo de matrícula"
                />
                {formik.touched.matricula_id && formik.errors.matricula_id && (
                    <p className="text-xs text-red-500 font-medium">{formik.errors.matricula_id}</p>
                )}
            </div>
        </ModalFormulario>
    );
}
