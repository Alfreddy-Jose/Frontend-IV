import Select from "react-select";
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
      minHeight: "44px",
    }),
    // Estilo del contenedor del menú (Dropdown)
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#0f172a" : "white", // Fondo oscuro similar a Notify
      border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
      zIndex: 9999,
      pointerEvents: "auto", // <--- Obliga a que acepte clics
    }),
    // Estilo de las opciones individuales
    option: (base, { isFocused, isSelected }) => ({
      ...base,
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
    input: (base) => ({
      ...base,
      color: isDark ? "#f1f5f9" : "#1e293b",
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? "#94a3b8" : "#6b7280",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    indicatorSeparator: () => ({ display: "none" }),
  };

  return (
    <div className={cn("group relative w-full", div_style)}>
      <div
        className={cn(
          "relative flex items-center w-full rounded-xl overflow-hidden transition-all",
          // MODO CLARO: bg-gray-200, texto oscuro
          // MODO OSCURO: bg-slate-800/40, texto claro
          "bg-gray-200 text-gray-900 dark:bg-slate-800/40 dark:text-slate-100",
          "focus-within:bg-gray-100 dark:focus-within:bg-slate-800/60 shadow-sm",
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
          className="peer w-full text-sm"
          classNamePrefix="react-select"
          value={getSelectedValues()}
          options={selectOptions}
          isDisabled={disabled}
          placeholder={placeholder}
          onChange={handleChange}
          isMulti={isMulti}
          onBlur={() => formik.setFieldTouched(name, true, false)}
          isClearable
          menuPosition="fixed"
          menuPortalTarget={
            typeof document !== "undefined" ? document.body : null
          }
          styles={customStyles}
        />

        <span className="absolute bottom-0 left-1/2 h-[2.5px] w-0 bg-primary transition-all duration-300 ease-in-out peer-focus-within:left-0 peer-focus-within:w-full" />
      </div>
    </div>
  );
}

export default SelectSearch;
