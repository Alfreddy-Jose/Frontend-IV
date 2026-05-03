import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut, ArrowLeftRight } from "lucide-react";

const RecentMovements = () => {
  // Datos de ejemplo (Luego podrías pasarlos por props si vienen de una API)
  const movimientos = [
    { id: 1, item: "Laptop Dell XPS 13", time: "Hace 10 min", cant: 5, tipo: "entrada" },
    { id: 2, item: "Monitor LG 24'", time: "Hace 25 min", cant: 2, tipo: "salida" },
    { id: 3, item: "Teclado Mecánico", time: "Hace 1 hora", cant: 10, tipo: "traslado" },
  ];

  // Función para elegir el icono y color según el tipo
  const getIcon = (tipo) => {
    switch (tipo) {
      case "entrada":
        return { icon: LogIn, color: "text-green-600", bg: "bg-green-50" };
      case "salida":
        return { icon: LogOut, color: "text-red-600", bg: "bg-red-50" };
      case "traslado":
        return { icon: ArrowLeftRight, color: "text-blue-600", bg: "bg-blue-50" };
      default:
        return { icon: Clock, color: "text-gray-600", bg: "bg-gray-50" };
    }
  };

  return (
    <Card className="p-6 shadow-md border-gray-100 ">
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h2 className="font-bold text-gray-700">Últimos Movimientos</h2>
      </div>

      <div className="space-y-4">
        {movimientos.map((m) => {
          const style = getIcon(m.tipo);
          const IconTag = style.icon;

          return (
            <div key={m.id} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
              <div className={`p-2 rounded-lg h-fit ${style.bg}`}>
                <IconTag className={`w-4 h-4 ${style.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-800 dark:text-gray-100 font-semibold text-gray-800 leading-none mb-1">
                  {m.item}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 text-gray-500 uppercase font-medium">
                  {m.time} • Cantidad: {m.cant}
                </span>
              </div>
            </div>
          );
        })}

        <Button variant="ghost" className="w-full text-xs text-blue-600 hover:text-blue-700 mt-2">
          Ver todo el historial
        </Button>
      </div>
    </Card>
  );
};

export default RecentMovements;