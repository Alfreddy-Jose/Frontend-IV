import React from "react";
import { useHasPermission } from "@/hooks/useHasPermission";
import { useLapso } from "@/context/LapsoContext";

export function Guard({
  requiredPermissions,
  children,
  fallback = null,
  blockOnReadOnly = false,
}) {
  const hasPermission = useHasPermission();
  const { isReadOnly } = useLapso();

  // En modo consulta (lapso cerrado) se oculta la acción protegida.
  if (blockOnReadOnly && isReadOnly) {
    return fallback;
  }

  if (hasPermission(requiredPermissions)) {
    return <>{children}</>;
  }

  return fallback;
}
