import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ModernInput } from "@/components/shared/InputModerno";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import RoleHeader from "@/components/shared/RoleHeader";
import PermissionGroup from "@/components/shared/PermissionGroup";
import { notify } from "@/components/shared/Notify";
import { createRole, getAllRolesPermisos } from "@/services/rolService";
import { useState } from "react";


const CreateRoleForm = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const formik = useFormik({
    initialValues: {
      nombre: "",
      permisos: [],
    },
    validationSchema: Yup.object({
      nombre: Yup.string().required("El nombre es obligatorio"),
      permisos: Yup.array().min(1, "Selecciona al menos un permiso"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        console.log(values);
        await createRole(values);
        
        notify.success("Rol creado con éxito");
        onSuccess();
      } catch (error) {
        console.error(error);
        notify.error("Error al crear el rol");
      } finally {
        setSubmitting(false);
      }
    },
  });

  /* cargar permisos desde la API */
  const fetchRoles = async () => {
    try {
      const roles = await getAllRolesPermisos();
      const grouped = roles[0]?.groupedPermissions || {};
      const formattedData = Object.keys(grouped).map((key) => ({
        category: key.toUpperCase(),
        items: grouped[key].map((p) => ({
          id: p.full_name,
          label: p.full_name.split('.')[1] || p.full_name,
        })),
      }));
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching roles:", error);
      notify.error(
        "Error al obtener los roles. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  if (loading) {
    return <p>cargando...</p>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Botón para volver atrás */}
      <button
        onClick={onBack}
        type="button"
        className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Volver a la lista
      </button>

      {/* Header que reacciona a Formik */}
      <RoleHeader
        roleName={formik.values.nombre || "Nombre del Rol"}
        description={
          formik.values.descripcion || "Descripción de las responsabilidades"
        }
        onSave={formik.handleSubmit}
        loading={formik.isSubmitting}
      />

      {/* Inputs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del Rol</Label>
          <ModernInput
            id="nombre"
            name="nombre"
            placeholder="Ej: Administrador de PNF"
            value={formik.values.nombre}
            onChange={formik.handleChange}
          />
          {formik.errors.nombre && (
            <p className="text-xs text-red-500">{formik.errors.nombre}</p>
          )}
        </div>
      </div>

      {/* Grid de Grupos de Permisos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.length > 0 ? (
          data.map((group) => (
            <PermissionGroup
              key={group.category}
              title={group.category}
              permissions={group.items}
              selectedValues={formik.values.permisos}
              setFieldValue={formik.setFieldValue}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400">
            No se encontraron categorías de permisos.
          </p>
        )}
      </div>
    </div>
  );
};

export default CreateRoleForm;
