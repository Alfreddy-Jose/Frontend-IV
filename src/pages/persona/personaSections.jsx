import { User, MapPin, GraduationCap, Phone, Mail } from "lucide-react";

export const personaSections = [
  {
    title: "Datos Personales",
    icon: User,
    columns: 2,
    fields: [
      {
        label: "Cédula de Identidad",
        accessor: "cedula_persona",
      },
      {
        label: "Nombre Completo",
        render: (_, data) => (
          <span className="uppercase font-semibold text-slate-700 dark:text-slate-300">
            {data.nombre || ""} {data.apellido || ""}
          </span>
        ),
      },
      {
        label: "Tipo de Persona",
        accessor: "tipo_persona",
        render: (val) => (
          <span className="uppercase font-semibold text-slate-700 dark:text-slate-300">
            {val || "N/A"}
          </span>
        ),
      },
      {
        label: "Grado de Instrucción",
        accessor: "grado_inst",
      },
    ],
  },
  {
    title: "Información de Contacto",
    icon: Mail,
    columns: 2,
    fields: [
      {
        label: "Correo Electrónico",
        accessor: "email",
        render: (val) => val || "Sin registro",
      },
      {
        label: "Teléfono",
        accessor: "telefono",
        render: (val) => val || "Sin registro",
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
        accessor: "municipio.municipio",
        render: (val) => val?.toUpperCase() || "N/A",
      },
      {
        label: "Dirección de Habitación",
        accessor: "direccion",
        fullWidth: true,
        render: (val) => val?.toUpperCase() || "N/A",
      },
    ],
  },
];