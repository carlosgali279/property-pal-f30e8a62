import { Mail, Phone } from "lucide-react";
import { ArrendatarioSection } from "@/components/ArrendatarioSection";
import { Card } from "@/components/ui/card";
import type { Predio } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

export function ContactosSection({ predio }: { predio: Predio }) {
  const { contactoById } = useStore();

  return (
    <section className="space-y-5">
      <Card className="border-border p-5">
        <div>
          <p className="label-eyebrow">Propiedad</p>
          <h2 className="mt-1 font-display text-xl leading-none">Propietarios y socios</h2>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {predio.contactos.map((v) => {
            const c = contactoById(v.contactoId);
            const principal = v.rol === "propietario_principal";
            return (
              <li key={v.contactoId} className="relative border border-border bg-surface p-4 pl-6">
                <span
                  aria-hidden
                  className={`absolute inset-y-0 left-0 w-1.5 ${principal ? "bg-primary" : "bg-neutral"}`}
                />
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{c?.nombre}</p>
                  <span
                    className={`stamp ${principal ? "bg-primary-soft text-primary" : "bg-neutral-soft text-muted-foreground"}`}
                  >
                    <span className="stamp-dot" aria-hidden />
                    {principal ? "Principal" : "Socio"}
                  </span>
                </div>
                <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                  Participación {v.participacion ?? "—"}%
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-3.5" /> {c?.email}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
                  <Phone className="size-3.5" /> {c?.telefono}
                </p>
              </li>
            );
          })}
        </ul>
      </Card>

      <ArrendatarioSection predio={predio} />
    </section>
  );
}
