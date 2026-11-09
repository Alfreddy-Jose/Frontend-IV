import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

/**
 * Convierte nombres de columnas (ej. 'cedula_persona') a etiquetas legibles (ej. 'Cedula Persona')
 */
const formatLabel = (key) => {
    if (!key) return "";
    return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Formatea valores según su tipo de dato
 */
const renderValue = (val) => {
    if (val === null || val === undefined || val === "") {
        return <span className="text-slate-400 italic text-xs">Vacío</span>;
    }
    if (typeof val === "boolean") {
        return val ? "Sí" : "No";
    }
    if (typeof val === "object") {
        return JSON.stringify(val);
    }
    return String(val);
};

/**
 * Componente para mostrar datos de INSERTAR o ELIMINAR en formato Tabla
 */
const SingleDataDetailTable = ({ data, title }) => {
    if (!data || Object.keys(data).length === 0) return null;

    const entries = Object.entries(data);

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 w-full">
            {title && (
                <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>{title}</span>
                    <span className="text-[10px] font-normal text-slate-500 lowercase">
                        ({entries.length} campos)
                    </span>
                </div>
            )}
            <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 sticky top-0 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="px-4 py-2 font-semibold w-1/3">Campo</th>
                            <th className="px-4 py-2 font-semibold w-2/3">Valor Registrado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {entries.map(([key, value]) => (
                            <tr
                                key={key}
                                className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                            >
                                <td className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400">
                                    {formatLabel(key)}
                                </td>
                                <td className="px-4 py-2 text-slate-800 dark:text-slate-200 font-mono break-all">
                                    {renderValue(value)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/**
 * Componente para comparar datos en acciones de 'MODIFICAR'
 */
const ComparisonDataDetailTable = ({ anteriores, nuevos }) => {
    const keys = Array.from(
        new Set([...Object.keys(anteriores || {}), ...Object.keys(nuevos || {})])
    );

    if (keys.length === 0) return null;

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 w-full">
            <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Comparación de Valores
            </div>
            <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 sticky top-0 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="px-4 py-2 font-semibold w-1/3">Campo</th>
                            <th className="px-4 py-2 font-semibold w-1/3 text-red-600 dark:text-red-400">
                                Valor Anterior
                            </th>
                            <th className="px-4 py-2 font-semibold w-1/3 text-emerald-600 dark:text-emerald-400">
                                Valor Nuevo
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {keys.map((key) => {
                            const valAnt = anteriores?.[key];
                            const valNue = nuevos?.[key];
                            const isChanged =
                                JSON.stringify(valAnt) !== JSON.stringify(valNue);

                            return (
                                <tr
                                    key={key}
                                    className={
                                        isChanged
                                            ? "bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                                            : "hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                                    }
                                >
                                    <td className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400">
                                        {formatLabel(key)}
                                    </td>
                                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300 font-mono break-all bg-red-50/20 dark:bg-red-950/10">
                                        {renderValue(valAnt)}
                                    </td>
                                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300 font-mono break-all bg-emerald-50/20 dark:bg-emerald-950/10">
                                        {renderValue(valNue)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default function ShowBitacoraModal({ isOpen, bitacora, onClose }) {
    if (!bitacora) return null;

    const parseJson = (data) => {
        if (!data) return null;
        if (typeof data === "object") return data;
        try {
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    };

    const datosAnteriores = parseJson(bitacora.datos_anteriores);
    const datosNuevos = parseJson(bitacora.datos_nuevos);
    const accionNormalizada = bitacora.accion?.toUpperCase();

    const dateStr = bitacora.created_at;
    const formattedDate = dateStr
        ? new Intl.DateTimeFormat("es-VE", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dateStr))
        : "No disponible";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-3xl overflow-hidden p-0 max-h-[90vh]">
                <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-900 dark:to-slate-950 p-6 border-b border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex flex-col gap-2">
                            <span className="font-bold">Detalles del Registro</span>
                            <div className="flex gap-2 items-center">
                                <Badge
                                    className={
                                        accionNormalizada === "INSERTAR"
                                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                            : accionNormalizada === "ELIMINAR"
                                                ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                                                : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                    }
                                >
                                    {bitacora.accion}
                                </Badge>
                                <span className="text-sm text-slate-500 font-normal">
                                    ID Bitácora: #{bitacora.id}
                                </span>
                                <span className="text-sm text-slate-500 font-normal ml-auto">
                                    {formattedDate}
                                </span>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
                    {/* Metadatos Generales */}
                    <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                                Usuario:
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">
                                {bitacora.user?.name || "Sistema"} ({bitacora.user?.email || "Sin correo"})
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                                IP Address:
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">
                                {bitacora.ip_address || "N/A"}
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                                Módulo / Tabla:
                            </span>
                            <span className="text-slate-600 dark:text-slate-400 uppercase font-mono">
                                {bitacora.tabla}
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                                Registro ID Afinidad:
                            </span>
                            <span className="text-slate-600 dark:text-slate-400 font-mono">
                                #{bitacora.registro_id}
                            </span>
                        </div>
                    </div>

                    {/* Renderizado Estructurado de Datos */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-base border-b pb-2 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                            Datos del Registro
                        </h3>

                        {accionNormalizada === "MODIFICAR" && (
                            <ComparisonDataDetailTable
                                anteriores={datosAnteriores}
                                nuevos={datosNuevos}
                            />
                        )}

                        {accionNormalizada === "ELIMINAR" && (
                            <SingleDataDetailTable
                                data={datosAnteriores}
                                title="Información Eliminada"
                            />
                        )}

                        {accionNormalizada === "INSERTAR" && (
                            <SingleDataDetailTable
                                data={datosNuevos}
                                title="Información Insertada"
                            />
                        )}

                        {!datosAnteriores && !datosNuevos && (
                            <div className="p-4 text-center text-slate-500 italic border rounded-xl border-dashed dark:border-slate-800">
                                No hay detalles de datos estructurados para este registro.
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}