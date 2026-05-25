import { useCallback } from "react";

// Función utilitaria para capitalizar TODAS las palabras (puedes usarla en cualquier lugar)
export const capitalizeWords = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const useCapitalize = (formik) => {
  const handleCapitalizeChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Transformar: Cada palabra empieza en mayúscula
    const capitalizedValue = capitalizeWords(value);

    // Actualizar Formik manualmente
    if (formik && formik.setFieldValue) {
      formik.setFieldValue(name, capitalizedValue);
    }
  }, [formik]);

  return { handleCapitalizeChange };
};