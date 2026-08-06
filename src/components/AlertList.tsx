import { AlertTriangle, CalendarClock, FileWarning } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtFecha, type Alerta } from "@/lib/selectors";
import { cn } from "@/lib/utils";

const sev = {
  vencida: { label: "Vencido", cls: "bg-destructive/12 text-destructive border-destructive/30" },
  critica: { label: "Crítico", cls: "bg-destructive/10 text-destructive border-destructive/25" },
  proxima: { label: "Próximo", cls: "bg-warning/15 text-warning-foreground border-warning/40" },
};

export function AlertList({ items, showPredio = true }: { items: Alerta[]; showPredio?: boolean }) {
  if (items.length === 0) {
    return (
      <Card className="border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        <FileWarning className="mx-auto mb-2 size-5" />
        Sin vencimientos en los próximos 30 días.
      </Card>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((a, i) => (
        <li key={`${a.predioId}-${a.tipo}-${i}`}>
          <Card className="flex flex-col gap-3 border-border p-4 sm:flex-row sm:items-center">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-warning/15 text-warning-foreground">
              <AlertTriangle className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {a.tipo}
                {showPredio && (
                  <>
                    {" — "}
                    <Link
                      to="/predio/$predioId"
                      params={{ predioId: a.predioId }}
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      {a.predioNombre}
                    </Link>
                  </>
                )}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="size-3.5" />
                  Termina el {fmtFecha(a.fecha)}
                </span>
                <span>{a.detalle}</span>
              </p>
            </div>
            <Badge variant="outline" className={cn("shrink-0 self-start sm:self-center", sev[a.severidad].cls)}>
              {a.dias < 0 ? `Vencido hace ${Math.abs(a.dias)} días` : `En ${a.dias} días`}
            </Badge>
          </Card>
        </li>
      ))}
    </ul>
  );
}
