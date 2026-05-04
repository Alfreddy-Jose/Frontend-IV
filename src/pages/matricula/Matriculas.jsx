import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { notify } from "@/components/shared/Notify";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { deleteMatricula, getAllMatriculas } from "@/services/matriculaService";
import React, { useEffect, useState } from "react";
import { columnsMatriculas } from "./columnsMatriculas";
import { DataTable } from "@/components/shared/Data_table";
import CreatePnfModal from "../pnf/CreatePnfModal";
import CreateMatriculaModal from "./CreateMatriculaModal";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";

export default function Matriculas() {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMatriculaId, setEditingMatriculaId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMatricula = async () => {
    try {
      const users = await getAllMatriculas();
      setData(users);
    } catch (error) {
      console.error("Error fetching matricula:", error);
      notify.error(
        "Error al obtener los matriculas. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (matricula) => {
    setEditingMatriculaId(matricula.id);
  };

  const handleDelete = (matricula) => {
    setDeletingId(matricula.id);
  };

  useEffect(() => {
    fetchMatricula();
  }, []);

  const items = [
    { label: "Home", href: "/" },
    { label: "Matriculas", href: "/matriculas" },
  ];

  if (loading) {
    return <SkeletonTable />;
  }

  return (
    <div>
      <h1 className="mb-4 font-sans text-3xl font-semibold">Matrículas</h1>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb para la Navegación  */}
        <BreadcrumbReusable items={items} />

        {/* boton de agregar PNF al lado derecho  */}
        <div className="flex justify-end">
          <CreateMatriculaModal fetchMatriculas={fetchMatricula} />
        </div>

        {/* modal para Editar */}
{/*         <EditPnfModal
          isOpen={!!editingMatriculaId}
          matriculaId={editingMatriculaId}
          onClose={() => setEditingMatriculaId(null)}
          onSuccess={fetchMatricula}
        /> */}

        {/* modal para Eliminar */}
        <AlertDialogDestructive
          isOpen={!!deletingId}
          id={deletingId}
          onClose={() => setDeletingId(null)}
          onSuccess={fetchMatricula}
          deleteFunction={deleteMatricula}
        />

      </div>
      <div className="my-4">
        {/* Tabla de Usuarios */}
        <DataTable
          columns={columnsMatriculas(handleEdit, handleDelete)}
          data={data}
          filterColumn="nombre"
        />
      </div>
    </div>
  );
}
