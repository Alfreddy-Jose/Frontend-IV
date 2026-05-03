import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { SkeletonFormulario } from "./SkeletonFormulario";
import { Loader2 } from "lucide-react";

export function ModalFormulario({
  TextButton,
  icon = null,
  title,
  description,
  children,
  onSubmit,
  open,
  onOpenChange,
  button = true,
  loadingCargar = false,
  loading = false,
}) {
  if (loadingCargar) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
            <DialogTitle hidden>{title}</DialogTitle>
            <DialogDescription hidden >{description}</DialogDescription>
          <SkeletonFormulario />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Button para abrir formulario modal */}
      {button && (
        <DialogTrigger asChild>
          <Button variant="outline">
            {icon && <span>{icon}</span>}
            {TextButton}
          </Button>
        </DialogTrigger>
      )}

      {/* Contenido del formulario modal */}
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {/* Inputs*/}
          <div className="max-h-[60vh] overflow-y-auto mt-4">
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children}
            </FieldGroup>
          </div>

          {/* Footer del modal */}
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button> 
            </DialogClose>
            <Button type="submit">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
