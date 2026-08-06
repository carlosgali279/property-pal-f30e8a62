import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight, CheckCircle2, MapPin, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EstadoBadge } from "@/components/EstadoBadge";
import { TipoPredioBadge } from "@/components/TipoPredioBadge";
import type { Predio } from "@/lib/mock-data";
import { balance, completitud, fmtCOP } from "@/lib/selectors";
import { useStore } from "@/lib/store";

export function PredioCard({ predio, index = 0 }: { predio: Predio; index?: number }) {
  const { documentos, movimientos, tiposPara, contactoById } = useStore();
  const tipos = tiposPara(predio.tipoPredio);
  const comp = completitud(documentos, predio.id, tipos);
  const bal = balance(movimientos, predio.id);
  const pct = Math.round((comp.cargados / comp.total) * 100);
  const completo = comp.cargados === comp.total;

  return (
    <Link
      to="/predio/$predioId"
      params={{ predioId: predio.id }}
      className="group block rise-in outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <Card className="card-elevated relative h-full gap-0 overflow-hidden rounded-none border-border bg-card p-0 group-hover:border-primary">
        <span
          aria-hidden
          className={`absolute inset-y-0 left-0 w-1.5 ${
            predio.tipoPredio === "comercial" ? "bg-primary" : "bg-neutral"
          }`}
        />
        <div className="border-b border-border bg-muted pl-7 pr-5 py-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="label-eyebrow">{predio.razonSocial}</p>
              <h3 className="truncate font-display text-xl leading-tight text-foreground">{predio.nombre}</h3>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <EstadoBadge estado={predio.estado} />
              <TipoPredioBadge tipo={predio.tipoPredio} />
            </div>
          </div>
        </div>

        <div className="pl-7 pr-5 pt-4">
          <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {predio.direccion}, {predio.ciudad}
          </p>
        </div>

        <div className="space-y-2.5 pl-7 pr-5 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-medium">
              {completo ? (
                <CheckCircle2 className="size-4 text-primary" />
              ) : (
                <AlertTriangle className="size-4 text-warning" />
              )}
              {comp.cargados}/{comp.total} documentos
            </span>
            <span className="font-display text-base tabular-nums">{pct}%</span>
          </div>
          <Progress value={pct} className="h-1.5" />
          {!completo && (
            <p className="truncate text-xs text-muted-foreground">Falta: {comp.faltantes.join(", ")}</p>
          )}
        </div>

        <div className="ledger-grid mx-5 grid-cols-2 text-sm">
          <div className="ledger-cell">
            <p className="label-eyebrow">Ingresos 6m</p>
            <p className="mt-0.5 flex items-center gap-1 font-semibold tabular-nums text-primary">
              <TrendingUp className="size-3.5" />
              {fmtCOP(bal.ingresos)}
            </p>
          </div>
          <div className="ledger-cell">
            <p className="label-eyebrow">Gastos 6m</p>
            <p className="mt-0.5 flex items-center gap-1 font-semibold tabular-nums text-destructive">
              <TrendingDown className="size-3.5" />
              {fmtCOP(bal.gastos)}
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 pl-7 pr-5 pb-4 pt-4 text-xs text-muted-foreground">
          <Users className="size-3.5 shrink-0" />
          <span className="truncate">
            {predio.contactos.map((c) => contactoById(c.contactoId)?.nombre).filter(Boolean).join(" · ")}
          </span>
          <span className="ml-auto flex items-center gap-1 whitespace-nowrap font-semibold uppercase tracking-[0.08em] text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Ver detalle <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
