const PERMISSIONS_CONFIG = [
  {
    category: "PROGRAMA NACIONAL DE FORMACIÓN (PNF)",
    items: [
      { id: "pnf.ver", label: "Ver Listado" },
      { id: "pnf.crear", label: "Crear Nuevo" },
      { id: "pnf.editar", label: "Editar" },
      { id: "pnf.eliminar", label: "Eliminar" },
    ]
  },
  {
    category: "GESTIÓN DE ESTUDIANTES",
    items: [
      { id: "estudiantes.ver", label: "Ver Perfiles" },
      { id: "estudiantes.inscribir", label: "Inscribir" },
      { id: "estudiantes.documentos", label: "Gestionar Documentos" },
    ]
  }
];

export default PERMISSIONS_CONFIG;