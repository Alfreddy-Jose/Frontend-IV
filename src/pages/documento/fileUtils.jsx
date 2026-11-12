import { File, FileImage, FileSpreadsheet, FileText } from "lucide-react";

const EXTENSIONES_PDF = ["pdf"];
const EXTENSIONES_WORD = ["doc", "docx"];
const EXTENSIONES_EXCEL = ["xls", "xlsx", "csv"];
const EXTENSIONES_IMAGEN = ["jpg", "jpeg", "png", "webp", "gif"];

/**
 * Extrae la extensión de un nombre de archivo o ruta.
 */
export function obtenerExtension(valor = "") {
    const limpio = String(valor).split("?")[0];
    const punto = limpio.lastIndexOf(".");

    return punto >= 0 ? limpio.slice(punto + 1).toLowerCase() : "";
}

/**
 * Devuelve el icono de Lucide y su color según el tipo de archivo.
 */
export function obtenerIconoArchivo(valor = "") {
    const extension = obtenerExtension(valor) || String(valor).toLowerCase();

    if (EXTENSIONES_PDF.includes(extension)) {
        return { Icon: FileText, colorClass: "text-red-500" };
    }

    if (EXTENSIONES_WORD.includes(extension)) {
        return { Icon: FileText, colorClass: "text-blue-600" };
    }

    if (EXTENSIONES_EXCEL.includes(extension)) {
        return { Icon: FileSpreadsheet, colorClass: "text-green-600" };
    }

    if (EXTENSIONES_IMAGEN.includes(extension)) {
        return { Icon: FileImage, colorClass: "text-purple-500" };
    }

    return { Icon: File, colorClass: "text-slate-500" };
}

/**
 * Formatea un tamaño en bytes a una etiqueta legible.
 */
export function formatearTamano(bytes = 0) {
    if (!bytes || bytes <= 0) return "0 KB";

    const unidades = ["B", "KB", "MB", "GB"];
    const indice = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), unidades.length - 1);
    const valor = bytes / Math.pow(1024, indice);

    return `${valor.toFixed(indice === 0 ? 0 : 2)} ${unidades[indice]}`;
}

/**
 * Indica si la extensión pertenece a un tipo permitido por el módulo.
 */
export function extensionPermitida(nombre = "") {
    const extension = obtenerExtension(nombre);

    return [
        ...EXTENSIONES_PDF,
        ...EXTENSIONES_WORD,
        ...EXTENSIONES_EXCEL,
        ...EXTENSIONES_IMAGEN,
    ].includes(extension);
}
