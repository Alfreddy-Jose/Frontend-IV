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
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { ModernInput } from "./InputModerno";

export function ModalFormulario({ TextButton, icon = null, title, description, Inputs, children, onSubmit, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Button para abrir formulario modal */}
      <DialogTrigger asChild>
        <Button variant="outline">
          {icon && <span>{icon}</span>}
          {TextButton}
        </Button>
      </DialogTrigger>

      {/* Contenido del formulario modal */}
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>

          {/* Inputs*/}
          <div className="max-h-[60vh] overflow-y-auto">
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Inputs && Inputs.map((input, index) => (
                <Field key={input.id || index} className={input.fullWidth ? "col-span-full" : ""}>
                  <Label htmlFor={input.id}>{input.label}</Label>
                  <ModernInput {...input} />
                  {input.error && <p className="text-red-500 text-sm">{input.error}</p>}
                </Field>
              ))}
            </FieldGroup>

            {children}
          </div>

          {/* Footer del modal */}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
