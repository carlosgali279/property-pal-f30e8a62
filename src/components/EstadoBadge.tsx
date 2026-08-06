import { Badge } from "@/components/ui/badge";
import { ESTADOS, type EstadoPredio } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const styles: Record<EstadoPredio, string> = {
  arrendado: "bg-success/12 text-success border-success/25",
  en_construccion: "bg-warning/15 text-warning-foreground border-warning/40",
  disponible: "bg-secondary text-secondary-foreground border-border",
  en_tramite: "bg-primary/10 text-primary border-primary/25",
};

export function EstadoBadge({ estado, className }: { estado: EstadoPredio; className?: string }) {
  const label = ESTADOS.find((e) => e.value === estado)?.label ?? estado;
  return (
    <Badge variant="outline" className={cn("font-medium", styles[estado], className)}>
      {label}
    </Badge>
  );
}
