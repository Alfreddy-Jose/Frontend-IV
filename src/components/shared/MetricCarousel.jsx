import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MetricCarousel({ items, activeFilter, onFilterChange }) {
    const scroll = (offset) => {
        const container = document.getElementById("metricas-carousel");
        if (container) container.scrollLeft += offset;
    };

    return (
        <div className="relative group/carousel w-full">
            {/* Botón Izquierdo */}
            <button
                onClick={() => scroll(-240)}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-full shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
            >
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>

            {/* Contenedor Deslizable */}
            <div
                id="metricas-carousel"
                className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-none snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {items.map((item) => {
                    const isActive = activeFilter === item.value;
                    return (
                        <div
                            key={item.value}
                            onClick={() => onFilterChange(item.value)}
                            className={`min-w-[200px] flex-1 snap-start cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${isActive
                                    ? "bg-indigo-50 border-indigo-200 dark:bg-slate-800/80 dark:border-indigo-500/50 shadow-sm"
                                    : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900/60 dark:border-slate-800/50"
                                }`}
                        >
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                                {item.label}
                            </div>
                            <div className="text-2xl font-semibold mt-1 text-slate-900 dark:text-slate-100">
                                {item.count}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Botón Derecho */}
            <button
                onClick={() => scroll(240)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-full shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
            >
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
        </div>
    );
}