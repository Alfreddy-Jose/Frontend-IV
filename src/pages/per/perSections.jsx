import React from "react";
import { User, GraduationCap, BookOpen, FileCheck } from "lucide-react";

export const perSections = [
  {
    title: "Datos del Estudiante",
    icon: User,
    columns: 2,
    fields: [
      {
        label: "Cédula",
        accessor: "estudiante.persona.cedula_persona",
        render: (val) => val ? `V-${val}` : "N/A",
      },
      {
        label: "Nombre Completo",
        render: (_, data) => {
          const persona = data.estudiante?.persona || data.estudiante;
          return persona?.nombre
            ? `${persona.nombre} ${persona.apellido}`.toUpperCase()
            : "N/A";
        },
      },
    ],
  },
  {
    title: "Unidad Curricular",
    icon: BookOpen,
    columns: 2,
    fields: [
      {
        label: "Código",
        accessor: "unidad_curricular.codigo",
        render: (val) => val || "N/A",
      },
      {
        label: "Nombre",
        accessor: "unidad_curricular.nombre",
        render: (val) => (
          <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
            {val || "N/A"}
          </span>
        ),
      },
    ],
  },
  {
    title: "Docente Evaluador",
    icon: GraduationCap,
    columns: 2,
    fields: [
      {
        label: "Cédula",
        accessor: "docente.persona.cedula_persona",
        render: (val) => val ? `V-${val}` : "N/A",
      },
      {
        label: "Nombre Completo",
        render: (_, data) => {
          const persona = data.docente?.persona || data.docente;
          return persona?.nombre
            ? `${persona.nombre} ${persona.apellido}`.toUpperCase()
            : "N/A";
        },
      },
    ],
  },
  {
    title: "Evaluación",
    icon: FileCheck,
    columns: 2,
    fields: [
      {
        label: "Calificación",
        accessor: "calificacion",
        render: (val) => (
          <span className="font-bold text-base text-indigo-600 dark:text-indigo-400">
            {val !== null && val !== undefined ? `${val} / 100` : "SIN CALIFICAR"}
          </span>
        ),
      },
    ],
  },
];