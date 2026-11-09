import React from "react";
import { User, GraduationCap, FileText } from "lucide-react";

export const docenteSections = [
  {
    title: "Datos de la Persona",
    icon: User,
    columns: 2,
    fields: [
      {
        label: "Cédula",
        accessor: "persona.cedula_persona",
      },
      {
        label: "Nombre Completo",
        render: (_, data) =>
          `${data.persona?.nombre || ""} ${data.persona?.apellido || ""}`.toUpperCase(),
      },
      {
        label: "Correo Electrónico",
        accessor: "persona.email",
        render: (val) => val || "Sin registro",
      },
      {
        label: "Teléfono",
        accessor: "persona.telefono",
        render: (val) => val || "Sin registro",
      },
    ],
  },
  {
    title: "Información Académica y Categoría",
    icon: GraduationCap,
    columns: 2,
    fields: [
      {
        label: "PNF Adscrito",
        accessor: "pnf.nombre",
        render: (val) => val || "N/A",
      },
      {
        label: "Categoría",
        accessor: "categoria",
        render: (val) => (
          <span className="uppercase font-semibold text-blue-700 dark:text-blue-400">
            {val || "N/A"}
          </span>
        ),
      },
      {
        label: "Horas Académicas",
        accessor: "horas_dedicacion",
        render: (val) => `${val || 0} Horas`,
      },
    ],
  },
  {
    title: "Condición de Contrato / Dedicación",
    icon: FileText,
    columns: 2,
    fields: [
      {
        label: "Dedicación / Contrato",
        accessor: "condicion_contrato.dedicacion",
        render: (val) => val || "N/A",
      },
      {
        label: "Fecha de Inicio",
        accessor: "condicion_contrato.fecha_inicio",
        render: (val) =>
          val ? new Date(val).toLocaleDateString("es-ES") : "N/A",
      },
      {
        label: "Fecha de Fin",
        accessor: "condicion_contrato.fecha_fin",
        render: (val) =>
          val ? new Date(val).toLocaleDateString("es-ES") : "N/A",
      },
    ],
  },
];