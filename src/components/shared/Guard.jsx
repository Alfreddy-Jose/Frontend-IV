import React from "react";
import { useHasPermission } from "@/hooks/useHasPermission";

export function Guard({ requiredPermissions, children, fallback = null }) {
  const hasPermission = useHasPermission();

  if (hasPermission(requiredPermissions)) {
    return <>{children}</>;
  }

  return fallback;
}
