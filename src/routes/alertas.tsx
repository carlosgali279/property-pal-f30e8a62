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
        content: "Todos los contratos y documentos vencidos o próximos a vencer del portafolio, ordenados por urgencia.",
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
  const vencidos = items.filter((a) => a.dias < 0);
  const proximos30 = items.filter((a) => a.dias >= 0 && a.dias <= 30);
  const resto = items.filter((a) => a.dias > 30);

  return (
    <AppShell>
      <div className="border-b border-border pb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {isAdmin ? "Todos los predios" : `Predios de ${viewerLabel}`}
        </p>
        <h1 className="mt-1 text-3xl">Alertas de vencimiento</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} registro(s) ordenados por urgencia, calculados a partir de las fechas de terminación de los
          contratos.
        </p>
      </div>

      <h2 className="mt-8 text-lg">Vencidos</h2>
      <div className="mt-3">
        <AlertList items={vencidos} />
      </div>

      <h2 className="mt-10 text-lg">Próximos 30 días</h2>
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
