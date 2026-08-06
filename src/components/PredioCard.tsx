import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, MapPin, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EstadoBadge } from "@/components/EstadoBadge";
import type { Predio } from "@/lib/mock-data";
import { balance, completitud, fmtCOP } from "@/lib/selectors";
import { useStore } from "@/lib/store";

export function PredioCard({ predio }: { predio: Predio }) {
  const { documentos, movimientos, tiposDocumento, contactoById } = useStore();
  const comp = completitud(documentos, predio.id, tiposDocumento);
  const bal = balance(movimientos, predio.id);
  const pct = Math.round((comp.cargados / comp.total) * 100);
  const completo = comp.cargados === comp.total;

  return (
    <Link
      to="/predio/$predioId"
      params={{ predioId: predio.id }}
      className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full gap-0 overflow-hidden border-border p-0 shadow-[var(--shadow-card)] transition-all group-hover:-translate-y-0.5 group-hover:border-primary/30">
        <div className="flex items-start justify-between gap-3 p-5 pb-4">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg leading-tight">{predio.nombre}</h3>
            <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              {predio.direccion}, {predio.ciudad}
            </p>
          </div>
          <EstadoBadge estado={predio.estado} />
        </div>

        <div className="space-y-3 border-t border-border px-5 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-medium">
              {completo ? (
                <CheckCircle2 className="size-4 text-success" />
              ) : (
                <AlertTriangle className="size-4 text-warning" />
              )}
              {comp.cargados}/{comp.total} documentos
            </span>
            <span className="text-muted-foreground">{pct}%</span>
          </div>
          <Progress value={pct} className="h-1.5" />
          {!completo && (
            <p className="truncate text-xs text-muted-foreground">Falta: {comp.faltantes.join(", ")}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-border px-5 py-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ingresos 6m</p>
            <p className="mt-0.5 flex items-center gap-1 font-semibold text-success">
              <TrendingUp className="size-3.5" />
              {fmtCOP(bal.ingresos)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Gastos 6m</p>
            <p className="mt-0.5 flex items-center gap-1 font-semibold text-destructive">
              <TrendingDown className="size-3.5" />
              {fmtCOP(bal.gastos)}
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-border bg-muted/50 px-5 py-3 text-xs text-muted-foreground">
          <Users className="size-3.5 shrink-0" />
          <span className="truncate">
            {predio.contactos.map((c) => contactoById(c.contactoId)?.nombre).filter(Boolean).join(" · ")}
          </span>
        </div>
      </Card>
    </Link>
  );
}
