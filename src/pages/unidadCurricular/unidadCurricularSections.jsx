import React from "react";
import { BookOpen, Clock, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const unidadCurricularSections = [
    {
        title: "Información General",
        icon: BookOpen,
        columns: 2,
        fields: [
            {
                label: "Código",
                accessor: "codigo",
                render: (val) => val || "N/A",
            },
            {
                label: "Nombre",
                accessor: "nombre",
                render: (val) => val || "N/A",
            },
            {
                label: "Unidades de Crédito",
                accessor: "unidad_credito",
                render: (val) => val || "N/A",
            },
            {
                label: "Periodo",
                accessor: "periodo",
                render: (val) => {
                    if (val === "1" || val === 1) return "TRIMESTRAL";
                    if (val === "2" || val === 2) return "SEMESTRAL";
                    if (val === "3" || val === 3) return "ANUAL";
                    return val || "N/A";
                },
            },
            {
                label: "Descripción",
                accessor: "descripcion",
                fullWidth: true,
                render: (val) => val || "N/A",
            },
        ],
    },
    {
        title: "Horas Académicas",
        icon: Clock,
        columns: 3,
        fields: [
            {
                label: "H. Práctica",
                accessor: "hora_practica",
                render: (val) => (val !== undefined && val !== null ? `${val} Horas` : "N/A"),
            },
            {
                label: "H. Teórica",
                accessor: "hora_teorica",
                render: (val) => (val !== undefined && val !== null ? `${val} Horas` : "N/A"),
            },
            {
                label: "H. Totales",
                accessor: "hora_total_est",
                render: (val) => (val !== undefined && val !== null ? `${val} Horas` : "N/A"),
            },
        ],
    },
    {
        title: "Estructura Académica",
        icon: Layers,
        columns: 2,
        fields: [
            {
                label: "Trayecto",
                render: (_, data) => {
                    const trimestres = data?.trimestres;
                    const trayecto = Array.isArray(trimestres) && trimestres.length > 0 ? trimestres[0].trayecto : null;
                    return trayecto || "N/A";
                },
            },
            {
                label: "Trimestres",
                render: (_, data) => {
                    const trimestres = data?.trimestres;
                    if (Array.isArray(trimestres) && trimestres.length > 0) {
                        return (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {trimestres.map((trimestre) => (
                                    <Badge
                                        key={trimestre.id}
                                        variant="outline"
                                        className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800 font-semibold px-2 py-0.5 text-[10px]"
                                    >
                                        {trimestre.nombre}
                                    </Badge>
                                ))}
                            </div>
                        );
                    }
                    return "N/A";
                },
            },
        ],
    },
];
