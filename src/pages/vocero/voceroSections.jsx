import React from "react";
import { User, MapPin, Megaphone, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const voceroSections = [
  {
    title: "Datos Personales del Estudiante",
    icon: User,
    columns: 2,
    fields: [
      {
        label: "Cédula",
        accessor: "estudiante.persona.cedula_persona",
        render: (val) => (val ? `V-${val}` : "N/A"),
      },
      {
        label: "Nombre Completo",
        render: (_, data) => {
          const p = data.estudiante?.persona;
          return p?.nombre ? `${p.nombre} ${p.apellido}`.toUpperCase() : "N/A";
        },
      },
      {
        label: "Correo Electrónico",
        accessor: "estudiante.persona.email",
        render: (val) => val || "Sin registro",
      },
      {
        label: "Teléfono",
        accessor: "estudiante.persona.telefono",
        render: (val) => val || "Sin registro",
      },
      {
        label: "Grado de Instrucción",
        accessor: "estudiante.persona.grado_inst",
        render: (val) => val?.toUpperCase() || "N/A",
      },
      {
        label: "Tipo de Persona",
        accessor: "estudiante.persona.tipo_persona",
        render: (val) => val?.toUpperCase() || "N/A",
      },
    ],
  },
  {
    title: "Información de la Vocería",
    icon: Megaphone,
    columns: 2,
    fields: [
      {
        label: "Tipo de Vocería",
        accessor: "tipo_vocero",
        render: (val) => {
          const tipo = val?.toUpperCase();
          const cls =
            tipo === "PRINCIPAL"
              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
          return <Badge className={cls}>{tipo || "Sin asignar"}</Badge>;
        },
      },
      {
        label: "Estado",
        accessor: "activo",
        render: (val) => (val !== false ? "Activo" : "Inactivo"),
      },
    ],
  },
  {
    title: "Ubicación Académica",
    icon: BookOpen,
    columns: 2,
    fields: [
      {
        label: "PNF",
        accessor: "seccion.pnf.nombre",
        render: (val) => val?.toUpperCase() || "N/A",
      },
      {
        label: "Sede",
        accessor: "seccion.sede.nombre_sede",
        render: (val) => val?.toUpperCase() || "N/A",
      },
      {
        label: "Trayecto",
        accessor: "seccion.trayecto.nombre",
        render: (val) => val?.toUpperCase() || "N/A",
      },
      {
        label: "Sección",
        accessor: "seccion.nombre",
        render: (val) => val?.toUpperCase() || "N/A",
      },
      {
        label: "Lapso Académico",
        accessor: "seccion.lapso.nombre_lapso",
        render: (val) => val?.toUpperCase() || "N/A",
      },
      {
        label: "Tipo de Matrícula",
        accessor: "seccion.matricula.nombre",
        render: (val) => val?.toUpperCase() || "N/A",
      },
    ],
  },
  {
    title: "Ubicación Geográfica",
    icon: MapPin,
    columns: 2,
    fields: [
      {
        label: "Municipio",
        accessor: "estudiante.persona.municipio.municipio",
        render: (val) => val?.toUpperCase() || "N/A",
      },
      {
        label: "Estado",
        accessor: "estudiante.persona.municipio.estado.estado",
        render: (val) => val?.toUpperCase() || "N/A",
      },
      {
        label: "Dirección",
        accessor: "estudiante.persona.direccion",
        fullWidth: true,
        render: (val) => val?.toUpperCase() || "N/A",
      },
    ],
  },
];
