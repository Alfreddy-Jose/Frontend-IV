import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonFormulario() {
  return (
    <div className="w-full p-6 space-y-8 rounded-xl shadow-sm">
      {/* Título y Subtítulo */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" /> {/* "Editar Usuario" */}
        <Skeleton className="h-4 w-56" /> {/* "Editar un usuario existente" */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campo: Nombre */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" /> {/* Label: Nombre */}
          <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
        </div>

        {/* Campo: Apellido */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" /> {/* Label: Apellido */}
          <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
        </div>

        {/* Campo: Email */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" /> {/* Label: Email */}
          <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
        </div>

        {/* Campo: Contraseña */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" /> {/* Label: Contraseña */}
          <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4">
        <Skeleton className="h-10 w-24 rounded-md" /> {/* Botón Cancelar */}
        <Skeleton className="h-10 w-24 rounded-md bg-primary/20" /> {/* Botón Guardar */}
      </div>
    </div>
  )
}