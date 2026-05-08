import { Button } from "@/components/ui/button";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ModernInput } from "@/components/shared/InputModerno";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import RoleHeader from "@/components/shared/RoleHeader";
import PermissionGroup from "@/components/shared/PermissionGroup";
import { notify } from "@/components/shared/Notify";
import { createRole } from "@/services/rolService";
import { Checkbox } from "@/components/ui/checkbox";

const CreateRoleForm = ({ onBack, onSuccess, permissionsStructure }) => {
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

  const allPermissionIds = permissionsStructure.flatMap((group) =>
    group.items.map((i) => i.id),
  );

  const isAllSelected =
    allPermissionIds.length > 0 &&
    allPermissionIds.every((id) => formik.values.permisos.includes(id));

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      formik.setFieldValue("permisos", []);
    } else {
      formik.setFieldValue("permisos", allPermissionIds);
    }
  };

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
        roleName={formik.values.nombre || "Nuevo Rol"}
        actions={
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-create"
                checked={isAllSelected}
                onCheckedChange={handleSelectAllToggle}
              />
              <Label
                htmlFor="select-all-create"
                className="text-[11px] font-bold uppercase"
              >
                Seleccionar todo
              </Label>
            </div>

            <Button type="submit" onClick={formik.handleSubmit}>
              Guardar
            </Button>
          </div>
        }
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

      {formik.errors.permisos && formik.touched.permisos && (
        <p className="text-xs text-red-500">{formik.errors.permisos}</p>
      )}


      {/* Grid de Grupos de Permisos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {permissionsStructure?.length > 0 ? (
          permissionsStructure.map((group) => (
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
