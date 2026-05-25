import Select, { components } from "react-select";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme"; // Importamos el hook de tema

function SelectSearch({
  name,
  options = [],
  formik,
  valueKey = "id",
  labelKey = "nombre",
  disabled = false,
  placeholder = "SELECCIONE UNA OPCIÓN",
  div_style = "col-sm-6 col-xl-4",
  isMulti = false,
}) {
  // Obtenemos el tema actual para aplicar estilos condicionales
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const selectOptions = options.map((option) => ({
    value: option[valueKey],
    label: option[labelKey],
    ...option,
  }));

  const getSelectedValues = () => {
    const formikValue = formik.values[name];
    if (isMulti) {
      if (!Array.isArray(formikValue)) return [];
      return selectOptions.filter((opt) => formikValue.includes(opt.value));
    }
    return selectOptions.find((opt) => opt.value == formikValue) || null;
  };

  const handleChange = (selected) => {
    if (isMulti) {
      const values = selected ? selected.map((opt) => opt.value) : [];
      formik.setFieldValue(name, values);
    } else {
      const value = selected ? selected.value : "";
      formik.setFieldValue(name, value);
    }
    formik.setFieldTouched(name, true, false);
  };

// Configuración de estilos dinámicos basados en isDark
  const customStyles = {
    control: (base) => ({
      ...base,
      border: 0,
      boxShadow: "none",
      background: "transparent",
      minHeight: "34px", 
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "2px 12px", 
    }),
    // Estilo del contenedor del menú (Dropdown)
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#0f172a" : "white", 
      border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
      zIndex: 9999,
      pointerEvents: "auto", 
    }),
    // Estilo de las opciones individuales (CORREGIDO PARA ENCAJAR CON EL TAMAÑO COMPACTO)
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      padding: "6px 12px", // 👈 Reducido el padding vertical para que las filas sean más delgadas
      fontSize: "0.75rem", // 👈 Equivalente a text-xs por defecto
      // Un media query nativo para emular el comportamiento 'md:text-sm' de Tailwind
      "@media (min-width: 768px)": {
        fontSize: "0.875rem", // 👈 Equivalente a text-sm
      },
      backgroundColor: isSelected
        ? "#3b82f6"
        : isFocused
          ? isDark
            ? "#1e293b"
            : "#f1f5f9"
          : "transparent",
      color: isSelected ? "white" : isDark ? "#f1f5f9" : "#1e293b",
      cursor: "pointer",
      ":active": {
        backgroundColor: isDark ? "#334155" : "#e2e8f0",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? "#f1f5f9" : "#1e293b",
    }),
    // Estilo del contenedor de la opción seleccionada (la cajita)
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDark ? "#334155" : "#e2e8f0", 
      borderRadius: "8px",
    }),
    // Estilo del texto dentro de la cajita seleccionada
    multiValueLabel: (base) => ({
      ...base,
      color: isDark ? "#ffffff" : "#1e293b", 
      paddingLeft: "8px",
      paddingRight: "8px",
    }),
    // Estilo del botón de eliminar (la 'X') de la cajita
    multiValueRemove: (base) => ({
      ...base,
      color: isDark ? "#94a3b8" : "#6b7280",
      borderRadius: "0 8px 8px 0",
      ":hover": {
        backgroundColor: isDark ? "#ef4444" : "#fca5a5",
        color: "white",
      },
    }),
    input: (base) => ({
      ...base,
      color: isDark ? "#f1f5f9" : "#1e293b",
      margin: "0px",
      padding: "0px",
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? "#94a3b8" : "#6b7280",
      textTransform: "capitalize",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "180px", // Reducido de 220px a 180px para que el menú desplegable no sea tan alto e invasivo
      overflowY: "auto",
      paddingTop: "4px",    // Remueve espacios muertos internos superiores
      paddingBottom: "4px", // Remueve espacios muertos internos inferiores
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "4px 8px", 
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: "4px",
    }),
  };

  return (
    <div className={cn("group relative w-full", div_style)}>
      <div
        className={cn(
          "relative flex items-center w-full rounded-xl overflow-hidden transition-all border border-slate-200 dark:border-slate-800",
          // Estilo clonado exactamente de InputModerno
          "bg-slate-100 dark:bg-slate-900/60 focus-within:bg-white dark:focus-within:bg-slate-950/40 shadow-sm",
          disabled && "opacity-50 cursor-not-allowed",
          // Variables CSS para que React-Select las use internamente
          "[--menu-bg:white] dark:[--menu-bg:#1e293b]",
          "[--menu-border:#e2e8f0] dark:[--menu-border:#334155]",
          "[--option-text:#1e293b] dark:[--option-text:#f1f5f9]",
          "[--option-hover:#f1f5f9] dark:[--option-hover:#334155]",
          "[--multi-bg:#e2e8f0] dark:[--multi-bg:#334155]",
          "[--multi-text:#1e293b] dark:[--multi-text:#f1f5f9]",
        )}
      >
        <Select
          id={name}
          instanceId={name}
          name={name}
          className="peer w-full text-xs md:text-sm" // Escalado tipográfico idéntico al Input
          classNamePrefix="react-select"
          value={getSelectedValues()}
          options={selectOptions}
          isDisabled={disabled}
          placeholder={placeholder}
          onChange={handleChange}
          isMulti={isMulti}
          onBlur={() => formik.setFieldTouched(name, true, true)}
          isClearable
          menuPosition="fixed"
          menuPortalTarget={
            typeof document !== "undefined" ? document.body : null
          }
          components={{
            MenuList: ({ children, ...props }) => (
              <components.MenuList
                {...props}
                innerProps={{
                  ...props.innerProps,
                  onWheel: (e) => e.stopPropagation(),
                }}
              >
                {children}
              </components.MenuList>
            ),
          }}
          styles={customStyles}
        />

        {/* Línea animada: idéntica a InputModerno */}
        <span className="absolute bottom-0 left-1/2 h-[2.5px] w-0 bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-in-out peer-focus-within:left-0 peer-focus-within:w-full" />
      </div>
    </div>
  );
}

export default SelectSearch;