import { useState, useEffect } from "react";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { EditUserModal } from "@/pages/usuario/EditUserModal";
import { DataTable } from "@/components/shared/Data_table";
import { columns } from "./columnsUser";
import { getAllUsers, deleteUser, getRoles } from "@/services/userService";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { notify } from "@/components/shared/Notify";
import CreateUserModal from "./CreateUserModal";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { Guard } from "@/components/shared/Guard";

function Users() {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [roles, setRoles] = useState([]);

  const fetchUsers = async () => {
    try {
      const users = await getAllUsers();
      setData(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      notify.error(
        "Error al obtener los usuarios. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
  };

  const handleDelete = (user) => {
    setDeletingId(user.id);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
  const fetchRoles = async () => {
    const rolesData = await getRoles();
    setRoles(rolesData);
  };
  fetchRoles();
}, []);

  const items = [
    { label: "Home", href: "/" },
    { label: "Usuarios", href: "/usuarios" },
  ];

  if (loading) {
    return <SkeletonTable />;
  }

  return (
    <div>
      <h1 className="mb-4 font-sans text-3xl capitalize font-semibold">Usuarios</h1>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb para la Navegación  */}
        <BreadcrumbReusable items={items} />

        {/* boton de agregar usuario al lado derecho  */}
        <Guard requiredPermissions="usuario.crear">
          <div className="flex justify-end">
            <CreateUserModal fetchUsers={fetchUsers} roles={roles} />
          </div>
        </Guard>

        {/* modal para Editar */}
        <EditUserModal
          roles={roles}
          isOpen={!!editingUserId}
          userId={editingUserId}
          onClose={() => setEditingUserId(null)}
          onSuccess={fetchUsers}
        />

        {/* Modal de confirmación y eliminación del usuario */}
        <AlertDialogDestructive
          isOpen={!!deletingId}
          id={deletingId}
          onClose={() => setDeletingId(null)}
          onSuccess={fetchUsers}
          deleteFunction={deleteUser}
        />

      </div>
      <div className="my-4">
        {/* Tabla de Usuarios */}
        <DataTable
          columns={columns(handleEdit, handleDelete)}
          data={data}
          filterColumn="email"
        />
      </div>
    </div>
  );
}

export default Users;
