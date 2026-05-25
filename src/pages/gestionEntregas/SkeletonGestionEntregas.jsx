import { Skeleton } from "@/components/ui/skeleton"

export default function SkeletonGestionEntregas() {
  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* 1. Header Institucional */}
      <div>
        <h1 className="mb-2 font-sans text-3xl uppercase font-semibold text-foreground tracking-tight">
          <Skeleton className="h-9 w-72 md:w-[400px]" />
        </h1>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 mt-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Tabs Menu Wrapper */}
      <div className="w-full">
        {/* Navigation line */}
        <div className="flex items-center justify-between border-b border-border pb-2 mb-6">
          <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
            <Skeleton className="h-9 w-44 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>

          {/* Settings Drawer Subcomponent Skeleton */}
          <Skeleton className="h-9 w-52 rounded-md" />
        </div>

        {/* 1. Seguimiento de Docentes Content */}
        <div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 mt-6">
            {/* Main Column (75%) */}
            <div className="lg:col-span-3 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
              ))}
            </div>

            {/* Sidebar Column (25%) */}
            <div className="lg:col-span-1 space-y-5">
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
