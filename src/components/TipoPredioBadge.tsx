import { Building, Trees } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TIPOS_PREDIO, type TipoPredio } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const styles: Record<TipoPredio, string> = {
  comercial: "bg-primary/10 text-primary border-primary/25",
  no_arrendado: "bg-accent/20 text-accent-foreground border-border",
};

export function TipoPredioBadge({
  tipo,
  full = false,
  className,
}: {
  tipo: TipoPredio;
  full?: boolean;
  className?: string;
}) {
  const meta = TIPOS_PREDIO.find((t) => t.value === tipo);
  const Icon = tipo === "comercial" ? Building : Trees;
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", styles[tipo], className)}>
      <Icon className="size-3" />
      {full ? meta?.label : meta?.corto}
    </Badge>
  );
}
