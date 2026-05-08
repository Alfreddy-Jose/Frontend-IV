import { useCallback } from "react";

export const useCapitalize = (formik) => {
  const handleCapitalizeChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Transformar: Primera letra mayúscula, el resto minúscula
    // Si quieres capitalizar cada palabra (nombres compuestos), usa el segundo método
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

    // Actualizar Formik manualmente
    formik.setFieldValue(name, capitalizedValue);
  }, [formik]);

  return { handleCapitalizeChange };
};