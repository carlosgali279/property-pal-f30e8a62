import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIAS_GASTO, categoriasIngreso, type Predio, type TipoMovimiento } from "@/lib/mock-data";
import { balance, fmtCOP, fmtFecha, seriePorMes } from "@/lib/selectors";
import { useStore } from "@/lib/store";

export function FinanzasSection({ predio }: { predio: Predio }) {
  const { movimientos, isAdmin, eliminarMovimiento } = useStore();
  const bal = balance(movimientos, predio.id);
  const serie = seriePorMes(bal.list).map((r) => ({ ...r, neto: r.ingresos - r.gastos }));

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl">Seguimiento financiero</h2>
          <p className="text-sm text-muted-foreground">
            {predio.tipoPredio === "comercial"
              ? "Últimos movimientos registrados de ingresos y gastos"
              : "Predio no arrendado: el seguimiento se centra en los gastos (mantenimiento, impuestos, servicios y otros)"}
          </p>
        </div>
        {isAdmin && <MovimientoDialog predio={predio} />}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Total label="Ingresos" value={bal.ingresos} tone="success" />
        <Total label="Gastos" value={bal.gastos} tone="destructive" />
        <Total label="Balance neto" value={bal.neto} />
      </div>

      <Card className="border-border p-5">
        <p className="text-sm font-medium">Balance por periodo</p>
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serie}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${Math.round(v / 1_000_000)}M`}
              />
              <Tooltip
                formatter={(v) => fmtCOP(Number(v))}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--foreground)",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar name="Ingresos" dataKey="ingresos" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar name="Gastos" dataKey="gastos" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              <Line name="Neto" type="monotone" dataKey="neto" stroke="var(--chart-5)" strokeWidth={2} dot={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="overflow-hidden border-border p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              {isAdmin && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...bal.list]
              .sort((a, b) => b.fecha.localeCompare(a.fecha))
              .map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap">{fmtFecha(m.fecha)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        m.tipo === "ingreso"
                          ? "border-success/25 bg-success/12 text-success"
                          : "border-destructive/25 bg-destructive/10 text-destructive"
                      }
                    >
                      {m.tipo === "ingreso" ? "Ingreso" : "Gasto"}
                    </Badge>
                  </TableCell>
                  <TableCell>{m.categoria}</TableCell>
                  <TableCell className="text-muted-foreground">{m.nota ?? "—"}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${m.tipo === "ingreso" ? "text-success" : "text-destructive"}`}
                  >
                    {m.tipo === "ingreso" ? "+" : "−"}
                    {fmtCOP(m.monto)}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Eliminar movimiento"
                        onClick={() => {
                          eliminarMovimiento(m.id);
                          toast.success("Movimiento eliminado");
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            {bal.list.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Sin movimientos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </section>
  );
}

function Total({ label, value, tone }: { label: string; value: number; tone?: "success" | "destructive" }) {
  const cls = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <Card className="gap-0 border-border p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1.5 font-display text-2xl ${cls}`}>{fmtCOP(value)}</p>
    </Card>
  );
}

function MovimientoDialog({ predio }: { predio: Predio }) {
  const { addMovimiento } = useStore();
  const predioId = predio.id;
  const esComercial = predio.tipoPredio === "comercial";
  const ingresos = categoriasIngreso(predio.tipoPredio);
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<TipoMovimiento>(esComercial ? "ingreso" : "gasto");
  const [categoria, setCategoria] = useState<string>((esComercial ? ingresos : CATEGORIAS_GASTO)[0]!);
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [nota, setNota] = useState("");
  const categorias = tipo === "ingreso" ? ingresos : CATEGORIAS_GASTO;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" /> Registrar movimiento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo movimiento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select
                value={tipo}
                onValueChange={(v) => {
                  const t = v as TipoMovimiento;
                  setTipo(t);
                  setCategoria((t === "ingreso" ? ingresos : CATEGORIAS_GASTO)[0]!);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {esComercial && <SelectItem value="ingreso">Ingreso</SelectItem>}
                  <SelectItem value="gasto">Gasto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Categoría</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Monto (COP)</Label>
              <Input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="5000000" />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
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
              addMovimiento({ predioId, tipo, categoria, monto: valor, fecha, ...(nota ? { nota } : {}) });
              toast.success("Movimiento registrado");
              setMonto("");
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
