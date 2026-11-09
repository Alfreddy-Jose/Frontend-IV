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
import GenericShowModal from '@/components/shared/GenericShowModal';
import { GraduationCap } from 'lucide-react';
import { docenteSections } from './docenteSections';

export default function Docentes() {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDocenteId, setEditingDocenteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [dataSelect, setDataSelect] = useState([]);

  // Estados para el Modal de Detalles
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);

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

  // Handler para Abrir Modal de Detalles
  const handleShow = (docente) => {
    setSelectedDocente(docente);
    setIsShowModalOpen(true);
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

        {/* Modal para Ver Detalles */}
        <GenericShowModal
          isOpen={isShowModalOpen}
          onClose={() => setIsShowModalOpen(false)}
          title="Ficha del Docente"
          description={
            selectedDocente
              ? `${selectedDocente.persona?.nombre || ""} ${selectedDocente.persona?.apellido || ""} - C.I: ${selectedDocente.persona?.cedula_persona || ""}`
              : ""
          }
          icon={GraduationCap}
          data={selectedDocente}
          sections={docenteSections}
        />
      </div>
      <div className="my-4">
        {/* Tabla de Docentes */}
        <DataTable
          columns={columnsDocente(handleEdit, handleDelete, handleShow)}
          data={data}
          filterColumn="nombre"
        />
      </div>
    </div>
  );
}
