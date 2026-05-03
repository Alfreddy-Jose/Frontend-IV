import React from "react";
import { useState, useEffect, useMemo } from "react";
import { ModalFormulario } from "../../components/shared/ModalFormulario";
import { getSedeById, updateSede } from "@/services/sedeService";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Label } from "@/components/ui/label";
import { ModernInput } from "@/components/shared/InputModerno";
import { notify } from "@/components/shared/Notify";
import SelectSearch from "@/components/shared/SelectSearch";

export function EditSedeModal({ isOpen, onClose, userId, onSuccess }) {
  const [editingSede, setEditingSede] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSede, setLoadingSede] = useState(false);

    // Esquema de Validación con Yup
    const validationSchema = useMemo(
      () =>
        Yup.object({
          nro_sede: Yup.string()
            .matches(/^[0-9]+$/, "Solo se permiten números")
            .required("El número de sede es obligatorio"),
          nombre_sede: Yup.string().required("El nombre sede es obligatorio"),
          nombre_abreviado: Yup.string().required(
            "El nombre abreviado es obligatorio",
          ),
          estado_id: Yup.string().required("El estado es obligatorio"),
          municipio_id: Yup.string().required("El municipio es obligatorio"),
          direccion: Yup.string().required("La dirección es obligatoria"),
        }),
      [],
    );

  return <div>EditSedeModal</div>;
}
