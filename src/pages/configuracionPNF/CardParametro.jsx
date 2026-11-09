import React from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

export default function CardParametro({
  icon: Icon,
  title,
  name,
  value,
  error,
  touched,
  min,
  max,
  step = 1,
  suffix = "",
  formik,
  onChangeCallback,
}) {
  const hasError = touched && error;

  const updateValue = (newValue) => {
    // Clamp values
    const clamped = Math.max(min, Math.min(max, newValue));
    const roundedValue = parseFloat(clamped.toFixed(2));
    if (onChangeCallback) {
      onChangeCallback(roundedValue);
    } else {
      formik.setFieldValue(name, roundedValue);
    }
    formik.setFieldTouched(name, true, false);
  };

  const handleIncrement = () => {
    const currentValue = Number(value) || 0;
    updateValue(currentValue + step);
  };

  const handleDecrement = () => {
    const currentValue = Number(value) || 0;
    updateValue(currentValue - step);
  };

  const handleInputChange = (e) => {
    let val = e.target.value;
    if (val === "") {
      if (onChangeCallback) {
        onChangeCallback("");
      } else {
        formik.setFieldValue(name, "");
      }
      return;
    }

    const numericVal = parseFloat(val);
    if (!isNaN(numericVal)) {
      updateValue(numericVal);
    } else {
      if (onChangeCallback) {
        onChangeCallback(val);
      } else {
        formik.setFieldValue(name, val);
      }
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300",
        "bg-white dark:bg-[#0f172a]/50 shadow-sm hover:shadow-md",
        hasError
          ? "border-red-300 dark:border-red-900/50 bg-red-50/5 dark:bg-red-950/5 focus-within:ring-2 focus-within:ring-red-500/20"
          : "border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 dark:focus-within:border-indigo-500"
      )}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">
            {title}
          </h3>

          <div
            className={cn(
              "p-2.5 rounded-xl shrink-0 transition-colors duration-300",
              hasError
                ? "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400"
                : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
            )}
          >
            {Icon && <Icon className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Control Stepper / Input */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-1.5">
          {/* Botón Decremento */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={Number(value) <= min}
            className="flex shrink-0 items-center justify-center w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
            aria-label={`Reducir ${title}`}
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Input central */}
          <div
            className={cn(
              "flex-1 min-w-0 overflow-hidden flex items-center rounded-xl border transition-all duration-200",
              "bg-slate-100 dark:bg-slate-900 focus-within:bg-white dark:focus-within:bg-slate-950",
              hasError
                ? "border-red-300 dark:border-red-900/50 focus-within:border-red-500"
                : "border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 dark:focus-within:border-indigo-500"
            )}
          >
            <input
              type="number"
              name={name}
              value={value}
              onChange={handleInputChange}
              onBlur={formik.handleBlur}
              min={min}
              max={max}
              step={step}
              className={cn(
                "flex-1 min-w-0 text-center font-semibold text-sm py-2 pl-3 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                suffix ? "pr-1" : "pr-3",
                hasError
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-800 dark:text-slate-100"
              )}
            />
            {suffix && (
              <span className="shrink-0 pr-2.5 text-xs font-semibold text-slate-400 dark:text-slate-500 pointer-events-none select-none whitespace-nowrap">
                {suffix}
              </span>
            )}
          </div>

          {/* Botón Incremento */}
          <button
            type="button"
            onClick={handleIncrement}
            disabled={Number(value) >= max}
            className="flex shrink-0 items-center justify-center w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
            aria-label={`Aumentar ${title}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Input range slider for quick touch adjustment */}
        <div className="px-1 py-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={Number(value) || min}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              updateValue(val);
            }}
            className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 focus:outline-none"
          />
        </div>

        {/* Rango y error */}
        <div className="flex items-center justify-between text-[11px] font-medium min-h-[16px]">
          {hasError ? (
            <p className="text-red-500 dark:text-red-400 animate-fade-in whitespace-normal break-words max-w-full">
              {error}
            </p>
          ) : (
            <p className="text-slate-400 dark:text-slate-500">
              Límites: {min}{suffix} a {max}{suffix}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
