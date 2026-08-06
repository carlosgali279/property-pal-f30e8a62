import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración — Portafolio Inmobiliario" },
      {
        name: "description",
        content: "Preferencias del portafolio: tipos de documento, roles de acceso y parámetros de alertas.",
      },
      { property: "og:title", content: "Configuración — Portafolio Inmobiliario" },
      {
        property: "og:description",
        content: "Ajustes del portafolio de predios: documentos, roles y alertas.",
      },
    ],
  }),
  component: ConfiguracionPage,
});

function ConfiguracionPage() {
  return (
    <AppShell>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Preferencias</p>
      <h1 className="mt-1 text-3xl">Configuración</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sección en construcción.</p>

      <Card className="mt-6 border-dashed border-border bg-muted p-12 text-center">
        <Settings className="mx-auto size-6 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Aquí podrás administrar tipos de documento, roles y la ventana de alertas.
        </p>
      </Card>
    </AppShell>
  );
}
