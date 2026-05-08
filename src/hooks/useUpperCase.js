import { useCallback } from "react";

export const useUpperCase = (formik) => {
  const handleUpperCaseChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Convertir todo el texto a mayúsculas
    const upperCaseValue = value.toUpperCase();

    // Actualizar el estado en Formik de manera manual
    formik.setFieldValue(name, upperCaseValue);
  }, [formik]);

  return { handleUpperCaseChange };
};