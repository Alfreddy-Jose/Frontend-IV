import { AlertDialogDestructive } from '@/components/shared/AlertDialogDestructive';
import BreadcrumbReusable from '@/components/shared/BreadcrumbReusable';
import { notify } from '@/components/shared/Notify';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { deleteDocente, getAllDocentes, getDataSelect } from '@/services/docenteService';
import React, { useEffect, useState } from 'react'
import { columnsDocente } from './columnsDocente';
import { DataTable } from '@/components/shared/Data_table';
import CreateDocenteModal from './CreateDocenteModal';
import EditDocenteModal from './EditDocenteModal';
import { Guard } from '@/components/shared/Guard';

export default function Docentes() {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDocenteId, setEditingDocenteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [dataSelect, setDataSelect] = useState([]);

  // Fetch para traer lo Docentes
  const fetchDocentes = async () => {
    try {
      const docentes = await getAllDocentes();
      setData(docentes);
    } catch (error) {
      console.error("Error fetching docentes:", error);
      notify.error(
        "Error al obtener los docentes. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  // fetch para traer datos para crear docente
  useEffect(() => {
    const fetchDataSelect = async () => {
      try {
        const dataSelectDocente = await getDataSelect();
        setDataSelect(dataSelectDocente);
      } catch (error) {
        console.error("Error al obtener los Datos:", error);
        setDataSelect([]);
      }
    };

    fetchDataSelect();
  }, []);

  const handleEdit = (docente) => {
    setEditingDocenteId(docente.id);
  };

  const handleDelete = (docente) => {
    setDeletingId(docente.id);
  };

  useEffect(() => {
    fetchDocentes();
  }, []);

  const items = [
    { label: "Home", href: "/" },
    { label: "Docentes", href: "/docentes" },
  ];

  if (loading) {
    return <SkeletonTable />;
  }

  return (
    <div>
      <h1 className="mb-4 font-sans capitalize text-3xl font-semibold">Docentes</h1>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb para la Navegación  */}
        <BreadcrumbReusable items={items} />

        {/* Boton para agregar Docente */}
        <Guard requiredPermissions="docente.crear">
          <div className="flex justify-end">
            <CreateDocenteModal fetchDocente={fetchDocentes} dataSelect={dataSelect} />
          </div>
        </Guard> 

        {/* modal para Editar */}
        <EditDocenteModal
          isOpen={!!editingDocenteId}
          docenteId={editingDocenteId}
          onClose={() => setEditingDocenteId(null)}
          onSuccess={fetchDocentes}
          dataSelect={dataSelect}
        />

        {/* modal para Eliminar */}
        <AlertDialogDestructive 
          isOpen={!!deletingId}
          id={deletingId}
          onClose={() => setDeletingId(null)}
          onSuccess={fetchDocentes}
          deleteFunction={deleteDocente}
        />
      </div>
      <div className="my-4">
        {/* Tabla de Usuarios */}
        <DataTable
          columns={columnsDocente(handleEdit, handleDelete)}
          data={data}
          filterColumn="nombre"
        />
      </div>
    </div>
  );
}
