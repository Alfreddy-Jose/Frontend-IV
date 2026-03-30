import React from "react";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { Package, PlusIcon, User, LockIcon } from "lucide-react";
import { columnsRol } from "./columsRol";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { DataTable } from "@/components/shared/Data_table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { ModernInput } from "@/components/shared/InputModerno";
import { createRole } from "@/services/rolService";

function Roles() {
  // Esquema de Validación con Yup
  const validationSchema = Yup.object({
    nombre: Yup.string().required("El nombre del rol es obligatorio"),
    permisos: Yup.array().min(1, "Debes seleccionar al menos un permiso"),
  });

  // Configuración de Formik
  const formik = useFormik({
    initialValues: {
      nombre: "",
      permisos: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log("Datos para enviar al backend:", values);
      try {
        await createRole(values);
        alert("Rol creado exitosamente");
        // Aquí puedes resetear el formulario o recargar la lista de roles
        formik.resetForm();
      } catch (error) {
        console.error("Error al crear el rol:", error);
        alert("Error al crear el rol: " + (error.response?.data?.message || error.message));
      }
    },
  });

  const items = [
    { label: "Home", href: "/" },
    { label: "Roles", href: "/roles" },
  ];

  const payments = [
    { Nombre: "Administrador", permiso: "Full Access" },
    { Nombre: "Editor", permiso: "Edit Content" },
    { Nombre: "Viewer", permiso: "View Content" },
  ];

  // Estructura de permisos basada en (modulo.accion)
  const modulosConfig = [
    {
      id: "usuario",
      label: "Gestión de Usuarios",
      icon: <User className="w-4 h-4" />,
      extra: [],
    },
    {
      id: "rol",
      label: "Roles y Seguridad",
      icon: <LockIcon className="w-4 h-4" />,
      extra: [],
    },
    {
      id: "producto",
      label: "Catálogo de Productos",
      icon: <Package className="w-4 h-4" />,
      extra: ["subir_imagen", "exportar_pdf"],
    },
  ];

  const acciones = ["ver", "crear", "editar", "eliminar"];

  // 3. Función para manejar los Toggles
  const handleTogglePermission = (permId) => {
    const { permisos } = formik.values;
    if (permisos.includes(permId)) {
      // Si ya existe, lo quitamos
      formik.setFieldValue(
        "permisos",
        permisos.filter((p) => p !== permId),
      );
    } else {
      // Si no existe, lo agregamos
      formik.setFieldValue("permisos", [...permisos, permId]);
    }
  };

  return (
    <div>
      <h1 className="mb-4">Roles</h1>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb para la Navegación  */}
        <BreadcrumbReusable items={items} />

        {/* boton de agregar usuario al lado derecho  */}
        <div className="flex justify-end">
          <ModalFormulario
            title="Nuevo Rol"
            description="Crear un nuevo rol"
            TextButton="Nuevo Rol"
            icon={<PlusIcon />}
            onSubmit={formik.handleSubmit}>

            {/* Input Nombre del Rol */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Rol</Label>
                <ModernInput
                  id="nombre"
                  name="nombre"
                  placeholder="Ej: Administrador de Tienda"
                  onChange={formik.handleChange}
                  value={formik.values.nombre}
                  className="mb-4"
                />
                {formik.errors.nombre && formik.touched.nombre && (
                  <p className="text-xs text-red-500 font-medium mb-3 mt-0">
                    {formik.errors.nombre}
                  </p>
                )}
              </div>

              {/* Acordeón de Permisos */}
              <div className="space-y-4">
                <Label className="text-slate-500 uppercase text-[10px] font-black tracking-widest">
                  Matriz de Permisos ({formik.values.permisos.length}{" "}
                  seleccionados)
                </Label>

                <Accordion
                  type="multiple"
                  className="border rounded-xl bg-white dark:bg-slate-900 dark:border-slate-800/50"
                >
                  {modulosConfig.map((modulo) => (
                    <AccordionItem
                      value={modulo.id}
                      key={modulo.id}
                      className="border-b px-4 last:border-0"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                            {modulo.icon}
                          </div>
                          <span className="font-bold text-slate-700">
                            {modulo.label}
                          </span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="pb-6">
                        <div className="grid grid-cols-2 gap-3">
                          {acciones.map((accion) => {
                            const permId = `${modulo.id}.${accion}`; // Ej: "usuario.crear"
                            return (
                              <div
                                key={permId}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 dark:bg-slate-800/40 dark:border-slate-700/50"
                              >
                                <span className="text-sm font-medium text-slate-600 capitalize">
                                  {accion}
                                </span>
                                <Switch
                                  checked={formik.values.permisos.includes(
                                    permId,
                                  )}
                                  onCheckedChange={() =>
                                    handleTogglePermission(permId)
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>

                        {/* Especiales */}
                        {modulo.extra.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-dashed border-slate-200 space-y-2">
                            {modulo.extra.map((ex) => {
                              const permId = `${modulo.id}.${ex}`;
                              return (
                                <div
                                  key={permId}
                                  className="flex items-center justify-between px-2"
                                >
                                  <span className="text-xs text-slate-500 font-bold uppercase">
                                    {ex.replace("_", " ")}
                                  </span>
                                  <Switch
                                    checked={formik.values.permisos.includes(
                                      permId,
                                    )}
                                    onCheckedChange={() =>
                                      handleTogglePermission(permId)
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {formik.errors.permisos && formik.touched.permisos && (
                  <p className="text-xs text-red-500 font-medium">
                    {formik.errors.permisos}
                  </p>
                )}
              </div>
          </ModalFormulario>
        </div>
      </div>
      <div className="my-4">
        {/* Tabla de Usuarios */}
        <DataTable columns={columnsRol} data={payments} filterColumn="Nombre" />
      </div>
    </div>
  );
}

export default Roles;
