import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AlertList } from "@/components/AlertList";
import { alertas } from "@/lib/selectors";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/alertas")({
  head: () => ({
    meta: [
      { title: "Alertas de vencimiento — Portafolio Inmobiliario" },
      {
        name: "description",
        content: "Contratos de arrendamiento y documentos con vencimiento en los próximos 30 días por predio.",
      },
      { property: "og:title", content: "Alertas de vencimiento — Portafolio Inmobiliario" },
      {
        property: "og:description",
        content: "Revisa los contratos próximos a terminar y anticipa renovaciones y aumentos de canon.",
      },
    ],
  }),
  component: AlertasPage,
});

function AlertasPage() {
  const { documentos, visiblePredios, isAdmin, viewerLabel } = useStore();
  const items = alertas(documentos, visiblePredios, 90);
  const proximos30 = items.filter((a) => a.dias <= 30);
  const resto = items.filter((a) => a.dias > 30);

  return (
    <AppShell>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {isAdmin ? "Todos los predios" : `Predios de ${viewerLabel}`}
      </p>
      <h1 className="mt-1 text-3xl">Alertas de vencimiento</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Calculadas a partir de las fechas de terminación registradas en los contratos de arrendamiento.
      </p>

      <h2 className="mt-8 text-lg">Próximos 30 días</h2>
      <div className="mt-3">
        <AlertList items={proximos30} />
      </div>

      <h2 className="mt-10 text-lg">Siguientes 90 días</h2>
      <div className="mt-3">
        <AlertList items={resto} />
      </div>
    </AppShell>
  );
}
