import { Building, Trees } from "lucide-react";
import { TIPOS_PREDIO, type TipoPredio } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const styles: Record<TipoPredio, string> = {
  comercial: "bg-primary-soft text-primary",
  no_arrendado: "bg-neutral-soft text-muted-foreground",
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
    <span className={cn("stamp", styles[tipo], className)}>
      <Icon className="size-3" />
      {full ? meta?.label : meta?.corto}
    </span>
  );
}
