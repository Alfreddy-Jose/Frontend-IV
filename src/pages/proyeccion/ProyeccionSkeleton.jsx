import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProyeccionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb & Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-48 rounded-md" />
      </div>

      {/* Selectors Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>

      {/* Main Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Trayectos Cards */}
        <div className="lg:col-span-8 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-4"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* Right Column - Simulation Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-6">
            <Skeleton className="h-6 w-48 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <hr className="border-slate-200 dark:border-slate-800" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-5 w-24 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </div>
            ))}
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
