import React from "react";
import { BookOpen, GraduationCap, Calendar, MapPin, Users, Hash } from "lucide-react";

export const seccionSections = [
  {
    title: "Información de la Sección",
    icon: BookOpen,
    columns: 2,
    fields: [
      {
        label: "Nombre de Sección",
        accessor: "nombre",
        render: (val) => (
          <span className="font-bold text-blue-700 dark:text-blue-400 uppercase">
            {val || "N/A"}
          </span>
        ),
      },
      {
        label: "Número de Sección",
        accessor: "numero_seccion",
        render: (val) => val || "N/A",
      },
    ],
  },
  {
    title: "Ubicación Académica y Espacial",
    icon: MapPin,
    columns: 2,
    fields: [
      {
        label: "PNF",
        accessor: "pnf.nombre",
        render: (val) => val?.toUpperCase() || "N/A",
      },
      {
        label: "Sede",
        accessor: "sede.nombre_sede",
        render: (val) => val?.toUpperCase() || "N/A",
      },
      {
        label: "Trayecto",
        accessor: "trayecto.nombre",
        render: (val) => val?.toUpperCase() || "N/A",
      },
      {
        label: "Lapso Académico",
        accessor: "lapso.nombre_lapso",
        render: (val) => val?.toUpperCase() || "N/A",
      },
    ],
  },
  {
    title: "Datos Demográficos",
    icon: Users,
    columns: 2,
    fields: [
      {
        label: "Matrícula",
        accessor: "matricula.nombre",
        render: (val) => val || "N/A",
      },
    ],
  },
];