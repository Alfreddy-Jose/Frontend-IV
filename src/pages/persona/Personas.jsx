import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import { DataTable } from "@/components/shared/Data_table";
import { notify } from "@/components/shared/Notify";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { deletePersona, getAllPersonas } from "@/services/personaService";
import React, { useEffect, useState } from "react";
import { columnsPersonas } from "./columnsPersonas";
import { getEstados, getMunicipios } from "@/services/sedeService";
import CreatePersonasModal from "./CreatePersonasModal";
import EditPersonasModal from "./EditPersonasModal";
import { Guard } from "@/components/shared/Guard";
import GenericShowModal from "@/components/shared/GenericShowModal";
import { User } from "lucide-react";
import { personaSections } from "./personaSections";

export default function Personas() {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPersonaId, setEditingPersonaId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [estados, setEstados] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isShowOpen, setIsShowOpen] = useState(false);

  const fetchPersona = async () => {
    try {
      const persona = await getAllPersonas();
      setData(persona);
    } catch (error) {
      console.error("Error fetching persona:", error);
      notify.error(
        "Error al obtener los personas. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  // fetch para traer los Estados
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const estadosData = await getEstados();
        setEstados(estadosData);
      } catch (error) {
        console.error("Error al obtener los estados:", error);
        setEstados([]);
      }
    };
    fetchEstados();
  }, []);

  const handleEdit = (persona) => {
    setEditingPersonaId(persona.id);
  };

  const handleShow = (persona) => {
    setSelectedRecord(persona);
    setIsShowOpen(true);
  };

  const handleDelete = (persona) => {
    setDeletingId(persona.id);
  };

  useEffect(() => {
    fetchPersona();
  }, []);

  const items = [
    { label: "Home", href: "/" },
    { label: "Personas", href: "/personas" },
  ];

  if (loading) {
    return <SkeletonTable />;
  }

  return (
    <div>
      <h1 className="mb-4 font-sans text-3xl capitalize font-semibold">Personas</h1>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb para la Navegación  */}
        <BreadcrumbReusable items={items} />

        {/* Boton para crear una Persona */}
        <Guard requiredPermissions="persona.crear">
          <div className="flex justify-end">
            <CreatePersonasModal
              fetchPersona={fetchPersona}
              estados={estados}
              loadMunicipios={getMunicipios}
            />
          </div>
        </Guard>

        {/* Modal para Editar */}
        <EditPersonasModal
          isOpen={!!editingPersonaId}
          personaId={editingPersonaId}
          onClose={() => setEditingPersonaId(null)}
          onSuccess={fetchPersona}
          estados={estados}
          loadMunicipios={getMunicipios}
        />

        {/* modal para Eliminar */}
        <AlertDialogDestructive
          isOpen={!!deletingId}
          id={deletingId}
          onClose={() => setDeletingId(null)}
          onSuccess={fetchPersona}
          deleteFunction={deletePersona}
        />
      </div>
      <div className="my-4">
        {/* Tabla de Usuarios */}
        <DataTable
          columns={columnsPersonas(handleEdit, handleShow, handleDelete)}
          data={data}
          filterColumn="nombre"
        />
      </div>

      {/* Modal para ver detalles */}
      <GenericShowModal
        isOpen={isShowOpen}
        onClose={() => setIsShowOpen(false)}
        title="Resumen de Persona"
        description={selectedRecord ? `${selectedRecord.nombre} ${selectedRecord.apellido}` : ""}
        icon={User}
        data={selectedRecord}
        sections={personaSections}
      />

    </div>
  );
}
