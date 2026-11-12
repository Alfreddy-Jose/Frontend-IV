/**
 * Normaliza una dirección IP para mostrarla en la bitácora.
 *
 * - Convierte IPv4 mapeadas en IPv6 ("::ffff:192.0.2.10" -> "192.0.2.10").
 * - Devuelve "N/A" cuando el registro histórico no tiene IP guardada.
 */
export const formatIpAddress = (value) => {
    if (typeof value !== "string") return "N/A";

    const ip = value.trim();
    if (!ip) return "N/A";

    const mapeada = ip.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
    if (mapeada) return mapeada[1];

    return ip;
};
