import React from "react";
import { Package, Activity, Info, Calendar, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const getInventarioSections = (pnfs = []) => [
  // SECCIÓN FOTOGRAFÍA
  {
    title: "Fotografía del Bien",
    icon: ImageIcon,
    columns: 1,
    fields: [
      {
        label: "Foto Registrada",
        accessor: "imagen_url",
        fullWidth: true,
        render: (val, data) => {
          const imageUrl = val || data?.bien?.imagen_url;

          if (!imageUrl) {
            return (
              <span className="text-xs text-slate-400 italic">
                Sin fotografía registrada.
              </span>
            );
          }

          return (
            <div className="mt-1 relative w-full max-h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center p-2">
              <img
                src={imageUrl}
                alt="Fotografía del bien"
                className="max-h-60 w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
          );
        },
      },
    ],
  },
  {
    title: "Información Principal",
    icon: Package,
    columns: 2,
    fields: [
      {
        label: "Código Universidad",
        accessor: "codigo_uni",
        render: (val, data) => (
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {val || data?.bien?.codigo_uni || "S/C"}
          </span>
        ),
      },
      {
        label: "Nombre del Bien / Equipo",
        accessor: "nombre",
        render: (val, data) => val || data?.bien?.nombre || "Sin nombre",
      },
      {
        label: "Programa Nacional de Formación (PNF)",
        accessor: "pnf_id",
        render: (val, data) => {
          const pnfId = val || data?.bien?.pnf_id;
          
          // Si viene el objeto anidado por alguna otra relación, lo priorizamos
          if (data?.pnf?.nombre) return data.pnf.nombre;
          if (data?.bien?.pnf?.nombre) return data.bien.pnf.nombre;

          // Buscamos en el array de PNFs el que coincida con el pnf_id del registro
          const pnfEncontrado = pnfs.find((p) => String(p.id) === String(pnfId));
          
          return pnfEncontrado ? pnfEncontrado.nombre : "No asignado";
        },
      },
    ],
  },
  {
    title: "Estado y Diagnóstico",
    icon: Activity,
    columns: 2,
    fields: [
      {
        label: "Estado Operativo Actual",
        accessor: "estado_operativo",
        render: (val, data) => {
          const estado =
            val || data?.ultimo_reporte?.estado_operativo || "operativo";

          if (estado === "operativo") {
            return (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 capitalize font-semibold dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
              >
                Operativo
              </Badge>
            );
          }
          if (estado === "dañado") {
            return (
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200 capitalize font-semibold dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800"
              >
                Dañado
              </Badge>
            );
          }
          if (estado === "desincorporado") {
            return (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200 capitalize font-semibold dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"
              >
                Desincorporado
              </Badge>
            );
          }
          return <span className="capitalize">{estado}</span>;
        },
      },
      {
        label: "Lapso del Último Reporte",
        accessor: "ultimo_reporte.lapso_academico.nombre_lapso",
        render: (val, data) =>
          val || data?.lapso_academico?.nombre_lapso || "Sin lapso asignado",
      },
      {
        label: "Observaciones del Reporte",
        accessor: "ultimo_reporte.observaciones",
        fullWidth: true,
        render: (val, data) =>
          val || data?.observaciones || "Sin observaciones registradas.",
      },
    ],
  },
  {
    title: "Descripción y Especificaciones",
    icon: Info,
    columns: 1,
    fields: [
      {
        label: "Descripción Detallada",
        accessor: "descripcion",
        fullWidth: true,
        render: (val, data) =>
          val || data?.bien?.descripcion || "Sin descripción proporcionada.",
      },
    ],
  },
];