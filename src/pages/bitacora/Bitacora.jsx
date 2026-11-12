import React, { useEffect, useState, useMemo } from "react";
import { useFormik } from "formik";
import { notify } from "@/components/shared/Notify";
import { bitacoraService } from "@/services/bitacoraSevice";
import { DataTable } from "@/components/shared/Data_table";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import MetricCarousel from "@/components/shared/MetricCarousel"; // 1. Importar el carrusel de métricas
import { columnsBitacora } from "./columnsBitacora";
import { SkeletonTableFilter } from "@/components/shared/SkeletonTableFilter";
import ShowBitacoraModal from "./ShowBitacoraModal";
import { Search } from "lucide-react";

export default function Bitacora() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBitacoraDetails, setSelectedBitacoraDetails] = useState(null);

    // 2. Estado para almacenar el filtro rápido activo de las tarjetas
    const [filtroRapido, setFiltroRapido] = useState("todos");

    // Formik para los filtros del formulario
    const filterFormik = useFormik({
        initialValues: {
            search: "",
            accion: "",
        },
        onSubmit: () => {
            fetchBitacora();
        },
    });

    const fetchBitacora = async () => {
        try {
            setLoading(true);
            const params = {};

            if (filterFormik.values.search) {
                params.search = filterFormik.values.search;
            }
            if (filterFormik.values.accion) {
                params.accion = filterFormik.values.accion;
            }

            const res = await bitacoraService.getAll(params);

            let list = [];
            if (Array.isArray(res)) {
                list = res;
            } else if (res && res.data && Array.isArray(res.data)) {
                list = res.data;
            }

            setData(list);
        } catch (error) {
            console.error("Error fetching bitacora:", error);
            notify.error("Error al obtener la bitácora.");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBitacora();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 3. Cálculo de los contadores para las tarjetas rápidas
    const {
        countTotal,
        countInsertar,
        countModificar,
        countEliminar,
        countInicioSesion,
        countCierreSesion,
        countIntentoFallido,
    } = useMemo(() => {
        const safeData = Array.isArray(data) ? data : [];

        return {
            countTotal: safeData.length,
            countInsertar: safeData.filter((item) => item?.accion === "INSERTAR").length,
            countModificar: safeData.filter((item) => item?.accion === "MODIFICAR").length,
            countEliminar: safeData.filter((item) => item?.accion === "ELIMINAR").length,
            countInicioSesion: safeData.filter((item) => item?.accion === "INICIO_SESION").length,
            countCierreSesion: safeData.filter((item) => item?.accion === "CIERRE_SESION").length,
            countIntentoFallido: safeData.filter((item) => item?.accion === "INTENTO_FALLIDO").length,
        };
    }, [data]);

    // 4. Filtrado en memoria combinando el filtro rápido del MetricCarousel
    const filteredData = useMemo(() => {
        let result = Array.isArray(data) ? [...data] : [];

        if (filtroRapido && filtroRapido !== "todos") {
            result = result.filter((item) => item?.accion === filtroRapido);
        }

        return result;
    }, [data, filtroRapido]);

    // 5. Configuración de los elementos del MetricCarousel
    const carouselItems = [
        { label: "Todas las Acciones", value: "todos", count: countTotal },
        { label: "Insertar", value: "INSERTAR", count: countInsertar },
        { label: "Modificar", value: "MODIFICAR", count: countModificar },
        { label: "Eliminar", value: "ELIMINAR", count: countEliminar },
        { label: "Inicio de Sesión", value: "INICIO_SESION", count: countInicioSesion },
        { label: "Cierre de Sesión", value: "CIERRE_SESION", count: countCierreSesion },
        { label: "Intentos Fallidos", value: "INTENTO_FALLIDO", count: countIntentoFallido },
    ];

    const handleViewDetails = (bitacora) => {
        setSelectedBitacoraDetails(bitacora);
    };

    const items = [
        { label: "Home", href: "/" },
        { label: "Bitácora", href: "/bitacora" },
    ];

    if (loading) {
        return <SkeletonTableFilter />;
    }

    return (
        <div className="space-y-6">
            <h1 className="capitalize font-semibold text-3xl font-sans mb-4">
                Bitácora de Auditoría
            </h1>

            <div className="flex flex-col gap-4 mb-2 md:flex-row md:items-center md:justify-between">
                <BreadcrumbReusable items={items} />
            </div>

            {/* Carrusel de Tarjetas de Filtros Rápidos */}
            <MetricCarousel
                items={carouselItems}
                activeFilter={filtroRapido}
                onFilterChange={setFiltroRapido}
            />

            {/* Tabla de Datos pasándole los datos filtrados */}
            <div className="my-5">
                <DataTable
                    columns={columnsBitacora(handleViewDetails)}
                    data={filteredData} // Usar filteredData en lugar de data
                    filterColumn="user"
                />
            </div>

            {/* Modal para Ver Detalles */}
            <ShowBitacoraModal
                isOpen={!!selectedBitacoraDetails}
                bitacora={selectedBitacoraDetails}
                onClose={() => setSelectedBitacoraDetails(null)}
            />
        </div>
    );
}