import { ESTADOS, type EstadoPredio } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const styles: Record<EstadoPredio, string> = {
  arrendado: "bg-primary-soft text-primary",
  en_construccion: "bg-warning-soft text-warning-foreground",
  disponible: "bg-neutral-soft text-muted-foreground",
  en_tramite: "bg-info-soft text-info-foreground",
};

export function EstadoBadge({ estado, className }: { estado: EstadoPredio; className?: string }) {
  const label = ESTADOS.find((e) => e.value === estado)?.label ?? estado;
  return (
    <span className={cn("stamp", styles[estado], className)}>
      <span className="stamp-dot" aria-hidden />
      {label}
    </span>
  );
}
