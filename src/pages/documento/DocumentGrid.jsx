import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Download, Trash2 } from "lucide-react";
import { obtenerIconoArchivo } from "./fileUtils";

/**
 * Vista en cuadrícula de los documentos almacenados.
 * Cada tarjeta expone un menú contextual con las acciones Descargar / Eliminar.
 */
export function DocumentGrid({ documentos = [], onDownload, onDelete }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
            {documentos.map((documento) => {
                const { Icon, colorClass } = obtenerIconoArchivo(
                    documento.extension || documento.nombre || documento.tipo
                );

                return (
                    <ContextMenu key={documento.id}>
                        <ContextMenuTrigger asChild>
                            <div
                                role="button"
                                tabIndex={0}
                                title={documento.nombre}
                                aria-label={`Documento ${documento.nombre}`}
                                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-transparent p-3 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none"
                            >
                                <Icon className={`h-10 w-10 ${colorClass}`} strokeWidth={1.5} />
                                <span className="w-full truncate text-xs text-center select-none">
                                    {documento.nombre}
                                </span>
                            </div>
                        </ContextMenuTrigger>

                        <ContextMenuContent className="w-44">
                            <ContextMenuItem
                                className="cursor-pointer gap-2"
                                onSelect={() => onDownload?.(documento)}
                            >
                                <Download className="h-4 w-4" />
                                Descargar
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                                variant="destructive"
                                className="cursor-pointer gap-2"
                                onSelect={() => onDelete?.(documento)}
                            >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                            </ContextMenuItem>
                        </ContextMenuContent>
                    </ContextMenu>
                );
            })}
        </div>
    );
}
