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

export default function Personas() {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPersonaId, setEditingPersonaId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [estados, setEstados] = useState([]);

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
      <h1 className="mb-4 font-sans text-3xl font-semibold">Personas</h1>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb para la Navegación  */}
        <BreadcrumbReusable items={items} />

        {/* boton de agregar PNF al lado derecho  */}
        <div className="flex justify-end">
          <CreatePersonasModal 
            fetchPersona={fetchPersona}
            estados={estados}
            loadMunicipios={getMunicipios}
          />
        </div>

        {/* modal para Editar */}
{/*         <EditPnfModal
          isOpen={!!editingPnfId}
          pnfId={editingPnfId}
          onClose={() => setEditingPnfId(null)}
          onSuccess={fetchPnfs}
        /> */}

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
          columns={columnsPersonas(handleEdit, handleDelete)}
          data={data}
          filterColumn="nombre"
        />
      </div>
    </div>
  );
}
