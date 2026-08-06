import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes del portafolio — Portafolio Inmobiliario" },
      {
        name: "description",
        content: "Espacio para generar reportes consolidados en PDF y Excel del portafolio de predios.",
      },
      { property: "og:title", content: "Reportes del portafolio — Portafolio Inmobiliario" },
      {
        property: "og:description",
        content: "Reportes documentales y financieros consolidados de todos los predios.",
      },
    ],
  }),
  component: ReportesPage,
});

function ReportesPage() {
  return (
    <AppShell>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Consolidados</p>
      <h1 className="mt-1 text-3xl">Reportes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sección en construcción. Por ahora los reportes se generan desde el detalle de cada predio.
      </p>

      <Card className="mt-6 border-dashed border-border bg-muted p-12 text-center">
        <FileText className="mx-auto size-6 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Aquí vivirán los reportes consolidados del portafolio (PDF y Excel).
        </p>
        <Link to="/predios" className="mt-4 inline-block text-sm text-primary underline-offset-2 hover:underline">
          Ir al listado de predios
        </Link>
      </Card>
    </AppShell>
  );
}
