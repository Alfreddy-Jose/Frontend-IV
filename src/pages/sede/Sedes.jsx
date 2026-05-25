import BreadcrumbReusable from "@/components/shared/BreadcrumbReusable";
import React, { useEffect, useState } from "react";
import { columns } from "./columnsSede";
import { DataTable } from "@/components/shared/Data_table";
import { deleteSede, getAllSedes, getEstados, getMunicipios, getPnfs, getUniversidades } from "@/services/sedeService";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { notify } from "@/components/shared/Notify";
import CreateSedeModal from "./CreateSedeModal";
import { AlertDialogDestructive } from "@/components/shared/AlertDialogDestructive";
import { EditSedeModal } from "./EditSedeModal";
import { Guard } from "@/components/shared/Guard";

export default function Sedes() {
  // Estados
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [editingSedeId, setEditingSedeId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [pnfs, setPnfs] = useState([]);
  const [universidad, setUniversidad] = useState(null);
  const [estados, setEstados] = useState([]);

  const fetchSedes = async () => {
    try {
      const sedes = await getAllSedes();
      setData(sedes);
    } catch (error) {
      console.error("Error fetching sedes:", error);
      notify.error(
        "Error al obtener las sedes. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  // fetch para traer los PNFS
  useEffect(() => {
    const fetchPnfs = async () => {
      try {
        const response = await getPnfs();
        setPnfs(response || []);
      } catch (error) {
        console.error("Error al obtener los PNFS:", error);
        setPnfs([]);
      }
    };
    fetchPnfs();
  }, []);

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

  // Efecto para cargar universidad
  useEffect(() => {
    const getUniversidad = async () => {
      try {
        const response = await getUniversidades();
        setUniversidad(response || null);
      } catch (error) {
        console.error("Error fetching universidad data:", error);
        setUniversidad(null);
      }
    };

    getUniversidad();
  }, []);

  const handleEdit = (sede) => {
    setEditingSedeId(sede.id);
  };

  const onDelete = (sede) => {
    setDeletingId(sede.id);
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  const items = [
    { label: "Home", href: "/" },
    { label: "Sedes", href: "/sedes" },
  ];

  if (loading) {
    return <SkeletonTable />;
  }

  return (
    <div>
      <h1 className="mb-4 font-sans capitalize text-3xl font-semibold">Sedes</h1>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb para la Navegación  */}
        <BreadcrumbReusable items={items} />

        {/* boton de agregar usuario al lado derecho  */}
        <Guard requiredPermissions="sede.crear">
          <div className="flex justify-end">
            {<CreateSedeModal
              fetchSedes={fetchSedes}
              pnfs={pnfs}
              universidad={universidad}
              estados={estados}
              loadMunicipios={getMunicipios}
            />}
          </div>
        </Guard>

        {/* modal para Editar */}
        <EditSedeModal
          isOpen={!!editingSedeId}
          sedeId={editingSedeId}
          onClose={() => setEditingSedeId(null)}
          onSuccess={fetchSedes}
          pnfs={pnfs}
          universidad={universidad}
          estados={estados}
          loadMunicipios={getMunicipios}
        /> 

        {/* modal para Eliminar */}
        <AlertDialogDestructive
          isOpen={!!deletingId}
          id={deletingId}
          onClose={() => setDeletingId(null)}
          onSuccess={fetchSedes}
          deleteFunction={deleteSede}
        />
      </div>
      <div className="my-4">
        {/* Tabla de Usuarios */}
        <DataTable
          columns={columns(handleEdit, onDelete)}
          data={data}
          filterColumn="nombre_sede"
        />
      </div>
    </div>
  );
}
