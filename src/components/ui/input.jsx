import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full bg-transparent px-0 py-2 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        // Estilo moderno: sin borde general, solo línea inferior
        "border-0 border-b border-input rounded-none focus-visible:border-primary focus-visible:ring-0",
        className
      )}
      {...props} />
  );
}

export { Input }
