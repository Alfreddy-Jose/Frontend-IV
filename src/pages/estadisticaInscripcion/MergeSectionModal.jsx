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
import { Merge } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function MergeSectionModal({ isOpen, onClose, seccionOrigen, opciones, onConfirm }) {
    const [seccionDestinoId, setSeccionDestinoId] = useState("");
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        setSeccionDestinoId("");
        setConfirming(false);
    }, [seccionOrigen?.id, isOpen]);

    const seccionDestino = opciones.find(
        (o) => String(o.id) === String(seccionDestinoId)
    );

    const matriculaProyectada =
        (seccionOrigen?.matricula ?? 0) + (seccionDestino?.matricula ?? 0);

    const handleConfirm = async () => {
        if (!seccionDestinoId) return;
        setConfirming(true);
        try {
            await onConfirm({
                seccion_origen_id: seccionOrigen.id,
                seccion_destino_id: Number(seccionDestinoId),
            });
            onClose();
        } catch {
            // Error managed by parent
        } finally {
            setConfirming(false);
        }
    };

    if (!seccionOrigen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Merge className="w-5 h-5 text-amber-500" />
                        Fusionar Sección
                    </DialogTitle>
                    <DialogDescription>
                        Esta sección tiene muy baja matrícula ({seccionOrigen.matricula}).
                        Mueve a los estudiantes a otra sección afín.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Origen</p>
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                            {seccionOrigen.codigo ?? seccionOrigen.nombre}
                        </p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {seccionOrigen.matricula} estudiantes
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Seleccionar Sección Destino:
                        </label>
                        <Select
                            value={seccionDestinoId}
                            onValueChange={setSeccionDestinoId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione una sección..." />
                            </SelectTrigger>
                            <SelectContent>
                                {opciones.length === 0 ? (
                                    <div className="p-2 text-sm text-slate-500 text-center">
                                        No hay secciones similares disponibles.
                                    </div>
                                ) : (
                                    opciones.map((opc) => (
                                        <SelectItem key={opc.id} value={String(opc.id)}>
                                            {opc.codigo ?? opc.nombre} ({opc.matricula} estudiantes)
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {seccionDestino && (
                        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                            La sección <span className="font-semibold">{seccionDestino.codigo ?? seccionDestino.nombre}</span> quedará con un total de <strong>{matriculaProyectada}</strong> estudiantes tras la fusión.
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={confirming}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!seccionDestinoId || confirming}
                        className="gap-2"
                    >
                        <Merge className="w-4 h-4" />
                        {confirming ? "Procesando..." : "Confirmar Fusión"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
