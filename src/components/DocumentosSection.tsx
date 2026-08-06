import { useRef, useState } from "react";
import { CheckCircle2, CircleDashed, FileText, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tiposAplicables, type Predio } from "@/lib/mock-data";
import { diasHasta, fmtFecha } from "@/lib/selectors";
import { useStore } from "@/lib/store";

export function DocumentosSection({ predio }: { predio: Predio }) {
  const { documentos, tiposDocumento, isAdmin, subirDocumento, eliminarDocumento, addTipoDocumento } = useStore();
  const [tipoActivo, setTipoActivo] = useState<string | null>(null);
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [openTipo, setOpenTipo] = useState(false);
  const tipos = tiposAplicables(tiposDocumento, predio.tipoPredio);
  const docs = documentos.filter((d) => d.predioId === predio.id && tipos.includes(d.tipo));

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl">Documentos</h2>
          <p className="text-sm text-muted-foreground">
            {docs.length} de {tipos.length} tipos de documento cargados
          </p>
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={() => setOpenTipo(true)}>
            <Plus className="size-4" /> Nuevo tipo de documento
          </Button>
        )}
      </div>

      <div className="grid gap-3">
        {tipos.map((tipo) => {
          const doc = docs.find((d) => d.tipo === tipo);
          const dias = doc?.contrato ? diasHasta(doc.contrato.fechaTerminacion) : null;
          return (
            <Card key={tipo} className="flex flex-col gap-3 border-border p-4 sm:flex-row sm:items-center">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
                  doc ? "bg-success/12 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                {doc ? <CheckCircle2 className="size-4" /> : <CircleDashed className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{tipo}</p>
                {doc ? (
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <FileText className="size-3.5" />
                      {doc.archivo}
                    </span>
                    <span>Cargado {fmtFecha(doc.fechaCarga)}</span>
                    {doc.contrato && (
                      <span>
                        Vigencia {fmtFecha(doc.contrato.fechaInicio)} → {fmtFecha(doc.contrato.fechaTerminacion)} ·
                        aumento {doc.contrato.aumentoCanon}%
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm text-muted-foreground">Sin archivo cargado</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {dias !== null && dias <= 30 && (
                  <Badge variant="outline" className="border-warning/40 bg-warning/15 text-warning-foreground">
                    {dias < 0 ? "Vencido" : `Vence en ${dias} días`}
                  </Badge>
                )}
                {isAdmin ? (
                  <>
                    <Button size="sm" variant={doc ? "outline" : "default"} onClick={() => setTipoActivo(tipo)}>
                      <Upload className="size-4" /> {doc ? "Reemplazar" : "Subir"}
                    </Button>
                    {doc && (
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Eliminar documento"
                        onClick={() => {
                          eliminarDocumento(doc.id);
                          toast.success("Documento eliminado");
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </>
                ) : (
                  <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                    {doc ? "Disponible" : "Pendiente"}
                  </Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <SubirDialog
        predioId={predio.id}
        tipo={tipoActivo}
        onClose={() => setTipoActivo(null)}
        onSubmit={subirDocumento}
      />

      <Dialog open={openTipo} onOpenChange={setOpenTipo}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nuevo tipo de documento</DialogTitle>
            <DialogDescription>Amplía la lista de tipos requeridos para todos los predios.</DialogDescription>
          </DialogHeader>
          <Input value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)} placeholder="Ej. Paz y salvo predial" />
          <DialogFooter>
            <Button
              onClick={() => {
                if (!nuevoTipo.trim()) return;
                addTipoDocumento(nuevoTipo.trim());
                toast.success("Tipo de documento agregado");
                setNuevoTipo("");
                setOpenTipo(false);
              }}
            >
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function SubirDialog({
  predioId,
  tipo,
  onClose,
  onSubmit,
}: {
  predioId: string;
  tipo: string | null;
  onClose: () => void;
  onSubmit: ReturnType<typeof useStore>["subirDocumento"];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [aumento, setAumento] = useState("7");
  const esContrato = tipo === "Contrato de arrendamiento";

  const cerrar = () => {
    setArchivo("");
    setInicio("");
    setFin("");
    onClose();
  };

  return (
    <Dialog open={tipo !== null} onOpenChange={(o) => !o && cerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir “{tipo}”</DialogTitle>
          <DialogDescription>
            La carga es simulada: el archivo se registra en la lista pero no se almacena.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Archivo</Label>
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
          {esContrato && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Fecha de inicio</Label>
                  <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Fecha de terminación</Label>
                  <Input type="date" value={fin} onChange={(e) => setFin(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>% de aumento del canon</Label>
                <Input type="number" step="0.1" value={aumento} onChange={(e) => setAumento(e.target.value)} />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={cerrar}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (!archivo) {
                toast.error("Selecciona un archivo.");
                return;
              }
              if (esContrato && (!inicio || !fin)) {
                toast.error("Indica las fechas del contrato.");
                return;
              }
              onSubmit({
                predioId,
                tipo: tipo!,
                archivo,
                fechaCarga: new Date().toISOString().slice(0, 10),
                ...(esContrato
                  ? { contrato: { fechaInicio: inicio, fechaTerminacion: fin, aumentoCanon: Number(aumento) || 0 } }
                  : {}),
              });
              toast.success("Documento cargado (simulado)");
              cerrar();
            }}
          >
            Cargar documento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
