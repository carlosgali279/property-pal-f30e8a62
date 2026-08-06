import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ESTADOS, razonesSociales, TIPOS_PREDIO, type EstadoPredio, type Predio, type TipoPredio } from "@/lib/mock-data";
import { newPredioId, useStore } from "@/lib/store";

export function NuevoPredioDialog({ predio }: { predio?: Predio }) {
  const { upsertPredio, contactos } = useStore();
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState(predio?.nombre ?? "");
  const [direccion, setDireccion] = useState(predio?.direccion ?? "");
  const [ciudad, setCiudad] = useState(predio?.ciudad ?? "");
  const [razonSocial, setRazonSocial] = useState<string>(predio?.razonSocial ?? razonesSociales[0]!);
  const [estado, setEstado] = useState<EstadoPredio>(predio?.estado ?? "disponible");
  const [tipoPredio, setTipoPredio] = useState<TipoPredio>(predio?.tipoPredio ?? "comercial");
  const [seleccion, setSeleccion] = useState<string[]>(predio?.contactos.map((c) => c.contactoId) ?? []);

  const guardar = () => {
    if (!nombre.trim() || !direccion.trim() || !ciudad.trim()) {
      toast.error("Completa nombre, dirección y ciudad.");
      return;
    }
    upsertPredio({
      id: predio?.id ?? newPredioId(),
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      ciudad: ciudad.trim(),
      razonSocial,
      estado,
      tipoPredio,
      contactos: seleccion.map((id, i) => ({
        contactoId: id,
        rol: i === 0 ? "propietario_principal" : "socio",
        participacion: Math.round(100 / Math.max(seleccion.length, 1)),
      })),
    });
    toast.success(predio ? "Predio actualizado" : "Predio creado");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {predio ? (
          <Button variant="outline" size="sm">
            Editar información
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" /> Nuevo predio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{predio ? "Editar predio" : "Nuevo predio"}</DialogTitle>
          <DialogDescription>Los datos se guardan en la sesión actual (versión con datos de ejemplo).</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Nombre / identificador</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Bodega Guayabal 42" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Dirección</Label>
              <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Cra. 52 #12-42" />
            </div>
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Medellín" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Razón social</Label>
              <Select value={razonSocial} onValueChange={setRazonSocial}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {razonesSociales.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Estado</Label>
              <Select value={estado} onValueChange={(v) => setEstado(v as EstadoPredio)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Tipo de predio</Label>
            <Select value={tipoPredio} onValueChange={(v) => setTipoPredio(v as TipoPredio)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_PREDIO.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Los predios no arrendados no exigen contrato de arrendamiento, otrosí ni contacto del arrendatario.
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Propietarios y socios</Label>
            <p className="text-xs text-muted-foreground">El primero seleccionado queda como propietario principal.</p>
            <div className="grid gap-2 rounded-md border border-border p-3">
              {contactos.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={seleccion.includes(c.id)}
                    onCheckedChange={(v) =>
                      setSeleccion((prev) => (v ? [...prev, c.id] : prev.filter((x) => x !== c.id)))
                    }
                  />
                  {c.nombre}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={guardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
