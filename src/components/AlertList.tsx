import { AlertTriangle, CalendarClock, FileWarning } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { fmtFecha, type Alerta } from "@/lib/selectors";
import { cn } from "@/lib/utils";

const sev = {
  vencida: { stripe: "bg-destructive", chip: "bg-destructive-soft text-destructive", icon: "text-destructive" },
  critica: { stripe: "bg-destructive", chip: "bg-destructive-soft text-destructive", icon: "text-destructive" },
  proxima: { stripe: "bg-warning", chip: "bg-warning-soft text-warning-foreground", icon: "text-warning-foreground" },
};

export function AlertList({ items, showPredio = true }: { items: Alerta[]; showPredio?: boolean }) {
  if (items.length === 0) {
    return (
      <Card className="border-dashed border-border bg-muted p-6 text-center text-sm text-muted-foreground">
        <FileWarning className="mx-auto mb-2 size-5" />
        Sin vencimientos en los próximos 30 días.
      </Card>
    );
  }

  return (
    <ul className="border border-border">
      {items.map((a, i) => {
        const s = sev[a.severidad];
        return (
          <li
            key={`${a.predioId}-${a.tipo}-${i}`}
            className={cn("relative flex flex-col gap-3 bg-surface p-4 pl-6 sm:flex-row sm:items-center", i > 0 && "border-t border-border")}
          >
            <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", s.stripe)} />
            <AlertTriangle className={cn("size-4 shrink-0", s.icon)} />
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
            <span className={cn("stamp shrink-0 self-start sm:self-center", s.chip)}>
              <span className="stamp-dot" aria-hidden />
              {a.dias < 0 ? `Vencido hace ${Math.abs(a.dias)} días` : `En ${a.dias} días`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
