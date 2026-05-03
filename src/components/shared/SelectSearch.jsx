import Select from "react-select";
import { cn } from "@/lib/utils"; // Asegúrate de tener esta utilidad instalada

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
  // Adaptar las opciones al formato que espera react-select
  const selectOptions = options.map((option) => ({
    value: option[valueKey],
    label: option[labelKey],
    ...option,
  }));

  // Manejo seguro de valores para modo simple/múltiple
  const getSelectedValues = () => {
    const formikValue = formik.values[name];

    if (isMulti) {
      if (!Array.isArray(formikValue)) {
        return [];
      }
      return selectOptions.filter((opt) => formikValue.includes(opt.value));
    } else {
      return selectOptions.find((opt) => opt.value == formikValue) || null;
    }
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

  // Estilos inline para eliminar el borde por defecto de react-select
  const customStyles = {
    control: (base) => ({
      ...base,
      border: 0,
      boxShadow: "none",
      background: "transparent",
      minHeight: "44px",
    }),
    // Forzar que el menú esté por encima de cualquier modal de Shadcn o Radix
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
      position: "fixed",
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "200px", // Limita el alto para forzar el scroll interno
      overflowY: "auto", // Asegura que el scroll sea local
      WebkitOverflowScrolling: "touch", // Mejora scroll en móviles
      overscrollBehavior: "contain",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      pointerEvents: "auto", // <--- Obliga a que acepte clics
    }),
    indicatorSeparator: () => ({ display: "none" }),
  };

  return (
    <div className={cn("group relative w-full", div_style)}>
      {/* <label className="mt-4 block text-sm font-medium">{label}</label> */}

      <div
        className={cn(
          "relative flex items-center w-full rounded-xl overflow-hidden transition-all mt-1",
          "bg-gray-200 text-gray-500 dark:bg-slate-900 focus-within:bg-gray-100 dark:focus-within:bg-black shadow-inner",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <Select
          id={name}
          instanceId={name} // Evita errores de hidratación
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

        {/* Línea animada idéntica a ModernInput */}
        <span className="absolute bottom-0 left-1/2 h-[2.5px] w-0 bg-primary transition-all duration-300 ease-in-out peer-focus-within:left-0 peer-focus-within:w-full" />
      </div>
    </div>
  );
}

export default SelectSearch;
