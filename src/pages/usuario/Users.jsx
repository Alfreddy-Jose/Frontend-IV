import { PlusIcon } from "lucide-react";
import { useState, useEffect } from "react";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { ModalFormulario } from "@/components/shared/ModalFormulario";
import { DataTable } from "@/components/shared/Data_table";
import { columns } from "./columnsUser";
import { createUser, getAllUsers } from "@/services/userService";
import SkeletonTable from "@/components/shared/SkeletonTable";
import * as Yup from "yup";
import { useFormik } from "formik";

function Users() {
  // Esquema de Validación con Yup
  const validationSchema = Yup.object({
    name: Yup.string().required("El nombre es obligatorio"),
    lastname: Yup.string().required("El apellido es obligatorio"),
    email: Yup.string().email("Email inválido").required("El email es obligatorio"),
    password: Yup.string().min(6, "La contraseña debe tener al menos 6 caracteres").required("La contraseña es obligatoria"),
    rol: Yup.string().required("El rol es obligatorio"),
  });

    // Configuración de Formik
    const formik = useFormik({
      initialValues: {
        name: "",
        lastname: "",
        email: "",
        password: "",
        rol: "",
      },
      validationSchema,
      onSubmit: async (values) => {
        console.log("Datos para enviar al backend:", values);
        try {
          await createUser(values);
          alert("Usuario creado exitosamente");
          // Recargar la lista de usuarios
          fetchUsers();
          // Cerrar el modal
          setOpenModal(false);
          // Aquí puedes resetear el formulario o recargar la lista de usuarios
          formik.resetForm();
        } catch (error) {
          console.error("Error al crear el usuario:", error);
          alert("Error al crear el usuario: " + (error.response?.data?.message || error.message));
        }
      },
    });
  

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const fetchUsers = async () => {
    try {
      const users = await getAllUsers();
      setData(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const items = [
    { label: "Home", href: "/" },
    { label: "Usuarios", href: "/usuarios" },
  ];

  const campos = [
    { id: "name" , name: "name", label: "Nombre", placeholder: "Ingrese el nombre", value: formik.values.name, onChange: formik.handleChange, onBlur: formik.handleBlur, error: formik.errors.name },
    { id: "lastname", name: "lastname", label: "Apellido", placeholder: "Ingrese el apellido", value: formik.values.lastname, onChange: formik.handleChange, onBlur: formik.handleBlur, error: formik.errors.lastname },
    { id: "email", name: "email", label: "Email", type: "email", placeholder: "Ingrese el email", value: formik.values.email, onChange: formik.handleChange, onBlur: formik.handleBlur, error: formik.errors.email },
    { id: "password", name: "password", label: "Contraseña", type: "password", placeholder: "Ingrese la contraseña", value: formik.values.password, onChange: formik.handleChange, onBlur: formik.handleBlur, error: formik.errors.password },
    { id: "rol", name: "rol", label: "Rol", placeholder: "Seleccione un rol", value: formik.values.rol, onChange: formik.handleChange, onBlur: formik.handleBlur, error: formik.errors.rol },
  ];

  return (
    <div>
      <h1 className="mb-4">Usuarios</h1>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb para la Navegación  */}
        <BreadcrumbReusable items={items} />

        {/* boton de agregar usuario al lado derecho  */}
        <div className="flex justify-end">
          <ModalFormulario 
            title="Nuevo Usuario" 
            description="Crear un nuevo usuario"
            TextButton="Nuevo Usuario"
            icon={<PlusIcon />} 
            Inputs={campos}
            onSubmit={formik.handleSubmit}
            open={openModal}
            onOpenChange={setOpenModal}
          />
        </div>
      </div>
      <div className="my-4">
        {/* Tabla de Usuarios */}
        {loading ? (
          <SkeletonTable />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            filterColumn="email"
            /*             statusFilterColumn="status"
            statusFilterOptions={[
              { value: "all", label: "All Status" },
              { value: "processing", label: "Processing" },
              { value: "pending", label: "Pending" },
              { value: "success", label: "Success" },
              { value: "failed", label: "Failed" }
            ]} */
          />
        )}
      </div>
    </div>
  );
}

export default Users;
