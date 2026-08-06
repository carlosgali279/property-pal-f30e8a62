import { useRef, useState } from "react";
import { BellRing, CheckCircle2, CircleDashed, FileText, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { TIPOS_IMPUESTO, type Impuesto, type Predio } from "@/lib/mock-data";
import { diasHasta, fmtCOP, fmtFecha } from "@/lib/selectors";
import { useStore } from "@/lib/store";

const estado = (i: Impuesto) => {
  if (i.pagado) return { label: "Pagado", stamp: "bg-primary-soft text-primary", stripe: "bg-primary" };
  const dias = diasHasta(i.fechaLimite);
  if (dias < 0)
    return {
      label: `Vencido hace ${Math.abs(dias)} días`,
      stamp: "bg-destructive-soft text-destructive",
      stripe: "bg-destructive",
    };
  if (dias <= 30)
    return {
      label: `Pagar en ${dias} días`,
      stamp: "bg-warning-soft text-warning-foreground",
      stripe: "bg-warning",
    };
  return { label: `En ${dias} días`, stamp: "bg-info-soft text-info", stripe: "bg-border" };
};

export function ImpuestosSection({ predio }: { predio: Predio }) {
  const { impuestos, isAdmin, actualizarImpuesto, eliminarImpuesto } = useStore();
  const lista = impuestos
    .filter((i) => i.predioId === predio.id)
    .sort((a, b) => Number(a.pagado) - Number(b.pagado) || a.fechaLimite.localeCompare(b.fechaLimite));

  const pendientes = lista.filter((i) => !i.pagado);
  const porPagar = pendientes.reduce((a, i) => a + i.monto, 0);
  const proximos = pendientes.filter((i) => diasHasta(i.fechaLimite) <= 30);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl">Impuestos</h2>
          <p className="text-sm text-muted-foreground">
            Recibos cargados y fecha tentativa de pago para notificar cuándo toca pagar.
          </p>
        </div>
        {isAdmin && <ImpuestoDialog predio={predio} />}
      </div>

      <div className="ledger-grid sm:grid-cols-3">
        <div className="ledger-cell">
          <p className="label-eyebrow">Obligaciones pendientes</p>
          <p className="mt-1.5 font-display text-2xl tabular-nums">{pendientes.length}</p>
        </div>
        <div className="ledger-cell">
          <p className="label-eyebrow">Monto por pagar</p>
          <p className="mt-1.5 font-display text-2xl tabular-nums text-destructive">{fmtCOP(porPagar)}</p>
        </div>
        <div className="ledger-cell">
          <p className="label-eyebrow">Notificaciones próximas (30 días)</p>
          <p className="mt-1.5 font-display text-2xl tabular-nums text-warning-foreground">{proximos.length}</p>
        </div>
      </div>

      {proximos.length > 0 && (
        <div className="relative flex flex-wrap items-center gap-3 border border-border bg-warning-soft p-4 pl-6">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-warning" />
          <BellRing className="size-4 shrink-0 text-warning-foreground" />
          <p className="text-sm text-warning-foreground">
            <span className="font-semibold">{proximos.length} impuesto(s)</span> con pago tentativo dentro de los
            próximos 30 días · el más cercano: {proximos[0]!.tipo} el {fmtFecha(proximos[0]!.fechaLimite)}.
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {lista.map((i) => {
          const e = estado(i);
          return (
            <Card key={i.id} className="relative flex flex-col gap-3 border-border p-4 pl-6 sm:flex-row sm:items-center">
              <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${e.stripe}`} />
              <span className={i.pagado ? "text-primary" : "text-muted-foreground"}>
                {i.pagado ? <CheckCircle2 className="size-4" /> : <CircleDashed className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {i.tipo} · {i.periodo}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                  <span className="tabular-nums">{fmtCOP(i.monto)}</span>
                  <span className="tabular-nums">Pago tentativo: {fmtFecha(i.fechaLimite)}</span>
                  {i.archivo ? (
                    <span className="flex items-center gap-1.5">
                      <FileText className="size-3.5" /> {i.archivo}
                    </span>
                  ) : (
                    <span className="text-destructive">Sin recibo cargado</span>
                  )}
                  {i.pagado && i.fechaPago && <span>Pagado el {fmtFecha(i.fechaPago)}</span>}
                </p>
                {i.nota && <p className="mt-1 text-sm text-muted-foreground">{i.nota}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`stamp ${e.stamp}`}>
                  <span className="stamp-dot" aria-hidden />
                  {e.label}
                </span>
                {isAdmin && (
                  <>
                    <ReciboDialog impuesto={i} />
                    {!i.pagado && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          actualizarImpuesto(i.id, { pagado: true, fechaPago: new Date().toISOString().slice(0, 10) });
                          toast.success("Impuesto marcado como pagado");
                        }}
                      >
                        Marcar pagado
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Eliminar impuesto"
                      onClick={() => {
                        eliminarImpuesto(i.id);
                        toast.success("Impuesto eliminado");
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
        {lista.length === 0 && (
          <Card className="border-dashed border-border bg-muted p-8 text-center text-sm text-muted-foreground">
            Sin impuestos registrados para este predio.
          </Card>
        )}
      </div>
    </section>
  );
}

function ReciboDialog({ impuesto }: { impuesto: Impuesto }) {
  const { actualizarImpuesto } = useStore();
  const [open, setOpen] = useState(false);
  const [archivo, setArchivo] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={impuesto.archivo ? "outline" : "default"}>
          <Upload className="size-4" /> {impuesto.archivo ? "Reemplazar recibo" : "Cargar recibo"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recibo de {impuesto.tipo}</DialogTitle>
          <DialogDescription>
            La carga es simulada: el archivo se registra en la lista pero no se almacena.
          </DialogDescription>
        </DialogHeader>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => setArchivo(e.target.files?.[0]?.name ?? "")}
        />
        <Button variant="outline" onClick={() => inputRef.current?.click()} className="justify-start">
          <Upload className="size-4" />
          {archivo || impuesto.archivo || "Seleccionar archivo…"}
        </Button>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (!archivo) {
                toast.error("Selecciona un archivo.");
                return;
              }
              actualizarImpuesto(impuesto.id, { archivo, fechaCarga: new Date().toISOString().slice(0, 10) });
              toast.success("Recibo cargado");
              setArchivo("");
              setOpen(false);
            }}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImpuestoDialog({ predio }: { predio: Predio }) {
  const { addImpuesto } = useStore();
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState(TIPOS_IMPUESTO[0]!);
  const [periodo, setPeriodo] = useState(String(new Date().getFullYear()));
  const [monto, setMonto] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [archivo, setArchivo] = useState("");
  const [nota, setNota] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" /> Registrar impuesto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo impuesto</DialogTitle>
          <DialogDescription>
            Define la fecha tentativa de pago: la plataforma notificará cuando esté a 30 días o menos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_IMPUESTO.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Periodo</Label>
              <Input value={periodo} onChange={(e) => setPeriodo(e.target.value)} placeholder="2026" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Monto (COP)</Label>
              <Input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="2500000" />
            </div>
            <div className="grid gap-2">
              <Label>Fecha tentativa de pago</Label>
              <Input type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Recibo (opcional)</Label>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => setArchivo(e.target.files?.[0]?.name ?? "")}
            />
            <Button variant="outline" onClick={() => inputRef.current?.click()} className="justify-start">
              <Upload className="size-4" />
              {archivo || "Seleccionar archivo…"}
            </Button>
          </div>
          <div className="grid gap-2">
            <Label>Nota (opcional)</Label>
            <Textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              const valor = Number(monto);
              if (!valor || valor <= 0) {
                toast.error("Ingresa un monto válido.");
                return;
              }
              if (!fechaLimite) {
                toast.error("Define la fecha tentativa de pago.");
                return;
              }
              addImpuesto({
                predioId: predio.id,
                tipo,
                periodo,
                monto: valor,
                fechaLimite,
                pagado: false,
                ...(archivo ? { archivo, fechaCarga: new Date().toISOString().slice(0, 10) } : {}),
                ...(nota ? { nota } : {}),
              });
              toast.success("Impuesto registrado");
              setMonto("");
              setFechaLimite("");
              setArchivo("");
              setNota("");
              setOpen(false);
            }}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
