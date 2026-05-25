import BreadcrumbReusable from '@/components/shared/BreadcrumbReusable';
import { DataTable } from '@/components/shared/Data_table';
import { notify } from '@/components/shared/Notify';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { deleteTrayecto, getAllTrayectos } from '@/services/trayectoService';
import React, { useEffect, useState } from 'react'
import { columnsTrayecto } from './columnsTrayecto';
import CreateTrayectoMoldal from './CreateTrayectoMoldal';
import { AlertDialogDestructive } from '@/components/shared/AlertDialogDestructive';
import { Guard } from '@/components/shared/Guard';

export default function Trayecto() {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchTrayecto = async () => {
    try {
      const trayecto = await getAllTrayectos();
      setData(trayecto); 
    } catch (error) {
      console.error("Error fetching trayecto:", error);
      notify.error(
        "Error al obtener los trayectos. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (trayecto) => {
    setDeletingId(trayecto.id);
  };

  useEffect(() => {
    fetchTrayecto();
  }, []);

  const items = [
    { label: "Home", href: "/" },
    { label: "Trayectos", href: "/trayectos" },
  ];

  if (loading) {
    return <SkeletonTable />;
  }

  return (
    <div>
      <h1 className="mb-4 font-sans text-3xl capitalize font-semibold">Trayectos</h1>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Breadcrumb para la Navegación  */}
        <BreadcrumbReusable items={items} />

        {/* boton de agregar PNF al lado derecho  */}
        <Guard requiredPermissions="trayecto.crear">
          <div className="flex justify-end">
            <CreateTrayectoMoldal fetchTrayecto={fetchTrayecto} />
          </div>
        </Guard>

        {/* modal para Eliminar */}
        <AlertDialogDestructive
          isOpen={!!deletingId}
          id={deletingId}
          onClose={() => setDeletingId(null)}
          onSuccess={fetchTrayecto}
          deleteFunction={deleteTrayecto}
        />
      </div>
      
      <div className="my-4">
        {/* Tabla de Trayectos */}
        <DataTable
          columns={columnsTrayecto(handleDelete)}
          data={data}
          filterColumn="nombre"
        />
      </div>
    </div>
  );
}
