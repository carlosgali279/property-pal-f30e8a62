import { Briefcase, Building2, CalendarDays, Mail, Phone, Wrench, Receipt, Scale, Store } from "lucide-react";
import { ROLES_ARRENDATARIO, type Predio, type RolArrendatarioContacto } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";

const rolLabel = (rol: RolArrendatarioContacto) =>
  ROLES_ARRENDATARIO.find((r) => r.value === rol)?.label ?? rol;

const rolTono: Record<RolArrendatarioContacto, { stamp: string; stripe: string; icon: typeof Mail }> = {
  representante_legal: { stamp: "bg-primary-soft text-primary", stripe: "bg-primary", icon: Briefcase },
  administrativo: { stamp: "bg-info-soft text-info-foreground", stripe: "bg-info", icon: Scale },
  pagos: { stamp: "bg-warning-soft text-warning-foreground", stripe: "bg-warning", icon: Receipt },
  mantenimiento: { stamp: "bg-neutral-soft text-muted-foreground", stripe: "bg-neutral", icon: Wrench },
  sitio: { stamp: "bg-neutral-soft text-muted-foreground", stripe: "bg-neutral", icon: Store },
};

export function ArrendatarioSection({ predio }: { predio: Predio }) {
  if (predio.tipoPredio !== "comercial") return null;

  const a = predio.arrendatario;

  if (!a) {
    return (
      <Card className="border-border p-5">
        <h2 className="text-lg">Arrendatario</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sin información de arrendatario registrada para este predio comercial.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-eyebrow">Arrendatario</p>
          <h2 className="mt-1 font-display text-xl leading-none">{a.nombre}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 tabular-nums">
            <Building2 className="size-3.5" /> NIT {a.nit}
          </span>
          <span className="flex items-center gap-1.5 tabular-nums">
            <CalendarDays className="size-3.5" /> Arrienda desde {a.desde}
          </span>
        </div>
      </div>

      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Contactos del arrendatario ({a.contactos.length})
      </p>

      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {a.contactos.map((c) => {
          const tono = rolTono[c.rol];
          const Icon = tono.icon;
          return (
            <li key={c.id} className="relative border border-border bg-surface p-4 pl-6">
              <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${tono.stripe}`} />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{c.nombre}</p>
                <span className={`stamp ${tono.stamp}`}>
                  <Icon className="size-3.5" />
                  {rolLabel(c.rol)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{c.cargo}</p>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="size-3.5" /> {c.email}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
                <Phone className="size-3.5" /> {c.telefono}
              </p>
              {c.nota ? (
                <p className="mt-3 border-t border-border pt-2 text-xs text-muted-foreground">{c.nota}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
