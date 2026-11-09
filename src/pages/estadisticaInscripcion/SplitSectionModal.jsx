import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Split, Users, AlertTriangle } from "lucide-react";
import SelectSearch from "@/components/shared/SelectSearch";

export function SplitSectionModal({ isOpen, onClose, seccion, opcionesTransferencia = [], onConfirm }) {
    const MIN_ORIGIN = 20;
    const MAX_SECTION = 45;

    const total = seccion?.matricula ?? 0;
    const defaultNueva = Math.max(0, Math.floor(total / 2));

    const [tipoAccion, setTipoAccion] = useState("crear_nueva"); // "crear_nueva" | "transferir"
    const [nuevoCodigo, setNuevoCodigo] = useState("");
    const [seccionDestinoId, setSeccionDestinoId] = useState("");
    const [estudiantesAMover, setEstudiantesAMover] = useState(defaultNueva);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTipoAccion("crear_nueva");
            setNuevoCodigo("");
            setSeccionDestinoId("");
            setEstudiantesAMover(Math.max(0, Math.floor(total / 2)));
            setConfirming(false);
        }
    }, [isOpen, total]);

    // Adapter for SelectSearch
    const formikAdapter = {
        values: { seccionDestinoId },
        setFieldValue: (k, v) => {
            if (k === "seccionDestinoId") {
                setSeccionDestinoId(v);
            }
        },
        setFieldTouched: () => { }
    };

    const seccionDestino = opcionesTransferencia.find(o => String(o.id) === String(seccionDestinoId));

    // Limits
    let maxSlider = total;
    const minSlider = 1;

    const estudiantesActual = total - estudiantesAMover;
    const actualInvalida = estudiantesActual < MIN_ORIGIN || estudiantesActual > MAX_SECTION;

    let destInvalida = false;
    if (tipoAccion === "crear_nueva") {
        destInvalida = estudiantesAMover < MIN_ORIGIN || estudiantesAMover > MAX_SECTION;
    } else {
        if (seccionDestino) {
            destInvalida = (seccionDestino.matricula + estudiantesAMover) > MAX_SECTION;
        } else {
            destInvalida = true; // no hay destino
        }
    }

    const hasWarning = actualInvalida || destInvalida;
    const missingData = (tipoAccion === "crear_nueva" && !nuevoCodigo.trim()) || (tipoAccion === "transferir" && !seccionDestinoId);

    const handleChange = (e) => {
        const val = Number(e.target.value);
        setEstudiantesAMover(val);
    };

    const handleConfirm = async () => {
        if (missingData) return;
        setConfirming(true);
        try {
            const payload = {
                seccion_origen_id: seccion.id,
                tipo_accion: tipoAccion,
                estudiantes_a_mover: estudiantesAMover,
            };
            if (tipoAccion === "crear_nueva") payload.nuevo_codigo = nuevoCodigo;
            if (tipoAccion === "transferir") payload.seccion_destino_id = Number(seccionDestinoId);

            await onConfirm(payload);
            onClose();
        } catch {
            // El error es manejado por el padre
        } finally {
            setConfirming(false);
        }
    };

    if (!seccion) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Split className="w-5 h-5 text-blue-500" />
                        Dividir o Transferir Estudiantes
                    </DialogTitle>
                    <DialogDescription>
                        Descongestionar la sección <strong>{seccion.codigo ?? seccion.nombre}</strong> con <strong>{total}</strong> estudiantes.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-1">

                    {/* TABS SIMULATION */}
                    <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                        <button
                            type="button"
                            className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${tipoAccion === "crear_nueva" ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
                            onClick={() => setTipoAccion("crear_nueva")}
                        >
                            Crear Nueva Sección
                        </button>
                        <button
                            type="button"
                            className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${tipoAccion === "transferir" ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
                            onClick={() => setTipoAccion("transferir")}
                        >
                            Transferir a Existente
                        </button>
                    </div>

                    {tipoAccion === "crear_nueva" && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Nombre / Código de la Nueva Sección
                            </label>
                            <input
                                type="text"
                                className="w-full flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-blue-800"
                                placeholder="Ej. 751101-B"
                                value={nuevoCodigo}
                                onChange={(e) => setNuevoCodigo(e.target.value)}
                            />
                        </div>
                    )}

                    {tipoAccion === "transferir" && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Buscar Sección Destino
                            </label>
                            <SelectSearch
                                formik={formikAdapter}
                                name="seccionDestinoId"
                                options={opcionesTransferencia}
                                placeholder="Seleccione una sección..."
                                valueKey="id"
                                labelKey="codigo"
                                div_style="w-full"
                            />
                            {seccionesDisponiblesParaTransferencia(opcionesTransferencia, seccionDestinoId)}
                        </div>
                    )}

                    {/* Resumen visual */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className={`rounded-lg border p-2.5 text-center transition-colors ${actualInvalida ? "border-red-300 bg-red-50 dark:bg-red-950/20" : "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20"}`}>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wide">Origen Quedará en</p>
                            <p className={`text-2xl font-bold ${actualInvalida ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                {estudiantesActual}
                            </p>
                        </div>

                        <div className={`rounded-lg border p-2.5 text-center transition-colors ${destInvalida ? "border-red-300 bg-red-50 dark:bg-red-950/20" : "border-blue-200 bg-blue-50 dark:bg-blue-950/20"}`}>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wide">Destino Quedará en</p>
                            <p className={`text-2xl font-bold ${destInvalida ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
                                {tipoAccion === "crear_nueva" ? estudiantesAMover : (seccionDestino ? seccionDestino.matricula + estudiantesAMover : "-")}
                            </p>
                        </div>
                    </div>

                    {/* Slider de ajuste */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                Estudiantes a Mover
                            </label>
                            <Badge variant="outline" className="text-sm font-bold">
                                {estudiantesAMover}
                            </Badge>
                        </div>
                        <input
                            type="range"
                            min={minSlider}
                            max={maxSlider > 0 ? maxSlider : 0}
                            value={estudiantesAMover}
                            onChange={handleChange}
                            disabled={maxSlider <= 0 || (tipoAccion === "transferir" && !seccionDestinoId)}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Mín. {minSlider}</span>
                            <span>Máx. {maxSlider > 0 ? maxSlider : 0}</span>
                        </div>
                    </div>

                    {/* Alerta de validación */}
                    {hasWarning && (
                        <Alert variant="destructive" className="py-2 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                            <AlertDescription className="text-xs leading-snug">
                                Revisa los datos: el origen debe quedar entre {MIN_ORIGIN} y {MAX_SECTION} alumnos. Para crear nueva sección, el destino también debe estar en ese rango. Para transferir, la sección destino no puede superar los {MAX_SECTION}.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="gap-2 mt-2">
                    <Button variant="outline" onClick={onClose} disabled={confirming}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={missingData || confirming}
                        className="gap-2"
                    >
                        <Split className="w-4 h-4" />
                        {confirming ? "Procesando..." : "Confirmar Acción"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function seccionesDisponiblesParaTransferencia(opciones, seccionDestinoId) {
    if (opciones.length === 0) {
        return <p className="text-xs text-red-500 mt-1">No hay secciones con disponibilidad para la misma Unidad Curricular.</p>
    }
    const seleccionada = opciones.find(o => String(o.id) === String(seccionDestinoId));
    if (seleccionada) {
        return <p className="text-xs text-slate-500 mt-1">Capacidad Actual: {seleccionada.matricula} estudiantes. Puede recibir hasta {45 - seleccionada.matricula}.</p>
    }
    return null;
}
