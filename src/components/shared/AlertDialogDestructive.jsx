// src/components/shared/AlertDialogDestructive.jsx
import { Trash2Icon, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { notify } from "@/components/shared/Notify";
import { cn } from "@/lib/utils";

// USAR EXPORTACIÓN NOMBRADA SIEMPRE
export function AlertDialogDestructive({
  isOpen,
  onClose,
  id,
  onSuccess,
  deleteFunction,
  // props para soporte dinámico
  title = "¿Confirmar acción?",
  description = "Esta acción no se puede deshacer.",
  confirmText = "Eliminar",
  variant = "destructive",
  icon: Icon = Trash2Icon,
  onConfirm,
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      if (onConfirm) {
        await onConfirm();
      } else if (deleteFunction) {
        const response = await deleteFunction(id);
        const menssageSuccess = 
          response?.message ||
          response?.data.message ||
          "Eliminado con éxito.";
        notify.success(menssageSuccess);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al procesar acción:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al procesar la solicitud. Por favor, inténtalo de nuevo.";
      notify.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Mapeo de estilos del ícono superior (AlertDialogMedia)
  const mediaClasses = {
    destructive: "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive",
    success: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
    default: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  };

  // Mapeo de variantes del botón (AlertDialogAction)
  const actionButtonVariants = {
    destructive: "destructive",
    success: "default",
    default: "default",
  };

  // Clases adicionales de Tailwind para afinar el botón según la variante
  const actionButtonClasses = {
    destructive: "",
    success: "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-500 border-none",
    default: "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 border-none",
  };

  const getProcessingText = () => {
    if (confirmText === "Eliminar") return "Eliminando...";
    if (confirmText === "Activar") return "Activando...";
    if (confirmText === "Cerrar") return "Cerrando...";
    return "Procesando...";
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className={cn(mediaClasses[variant] || mediaClasses.destructive)}>
            <Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isProcessing}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant={actionButtonVariants[variant] || "destructive"}
            className={cn(actionButtonClasses[variant] || "")}
            disabled={isProcessing}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleConfirm();
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {getProcessingText()}
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
