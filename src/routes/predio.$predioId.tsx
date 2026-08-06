import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, FileSpreadsheet, FileText, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AlertList } from "@/components/AlertList";
import { DocumentosSection } from "@/components/DocumentosSection";
import { FinanzasSection } from "@/components/FinanzasSection";
import { EstadoBadge } from "@/components/EstadoBadge";
import { TipoPredioBadge } from "@/components/TipoPredioBadge";
import { NuevoPredioDialog } from "@/components/NuevoPredioDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportarExcel, exportarPDF } from "@/lib/reports";
import { alertas, completitud } from "@/lib/selectors";
import { tiposAplicables } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/predio/$predioId")({
  head: () => ({
    meta: [
      { title: "Detalle del predio — Portafolio Inmobiliario" },
      {
        name: "description",
        content:
          "Información general, documentos, movimientos financieros y alertas de vencimiento de un predio del portafolio.",
      },
      { property: "og:title", content: "Detalle del predio — Portafolio Inmobiliario" },
      {
        property: "og:description",
        content: "Documentos cargados y faltantes, balance de ingresos y gastos y alertas de contrato.",
      },
    ],
  }),
  component: PredioDetalle,
});

function PredioDetalle() {
  const { predioId } = Route.useParams();
  const { visiblePredios, documentos, movimientos, tiposDocumento, contactoById, isAdmin, viewerLabel } = useStore();
  const predio = visiblePredios.find((p) => p.id === predioId);

  if (!predio) {
    return (
      <AppShell>
        <Card className="p-12 text-center">
          <h1 className="text-2xl">Predio no disponible</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este predio no existe o no está asociado a {viewerLabel}.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Volver al listado</Link>
          </Button>
        </Card>
      </AppShell>
    );
  }

  const tipos = tiposAplicables(tiposDocumento, predio.tipoPredio);
  const comp = completitud(documentos, predio.id, tipos);
  const pct = Math.round((comp.cargados / comp.total) * 100);
  const alertasPredio = alertas(documentos, [predio], 90);

  const reportInput = { predio, documentos, movimientos, tipos, contactoById };

  return (
    <AppShell>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Todos los predios
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl">{predio.nombre}</h1>
            <EstadoBadge estado={predio.estado} />
            <TipoPredioBadge tipo={predio.tipoPredio} full />
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {predio.direccion}, {predio.ciudad}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="size-3.5" /> {predio.razonSocial}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const ok = exportarPDF(reportInput);
              toast[ok ? "success" : "error"](
                ok ? "Reporte PDF generado (usa el diálogo de impresión)" : "Permite las ventanas emergentes",
              );
            }}
          >
            <FileText className="size-4" /> Reporte PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              exportarExcel(reportInput);
              toast.success("Reporte descargado para Excel");
            }}
          >
            <FileSpreadsheet className="size-4" /> Reporte Excel
          </Button>
          {isAdmin && <NuevoPredioDialog predio={predio} />}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="border-border p-5 lg:col-span-2">
          <h2 className="text-lg">Propietarios y socios</h2>
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
                    <span className={`stamp ${principal ? "bg-primary-soft text-primary" : "bg-neutral-soft text-muted-foreground"}`}>
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

        <Card className="gap-0 border-border p-5">
          <h2 className="text-lg">Completitud documental</h2>
          <p className="mt-3 font-display text-3xl">
            {comp.cargados}
            <span className="text-muted-foreground">/{comp.total}</span>
          </p>
          <Progress value={pct} className="mt-3 h-2" />
          {comp.faltantes.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Faltantes</p>
              <ul className="mt-2 space-y-1 text-sm">
                {comp.faltantes.map((f) => (
                  <li key={f} className="text-muted-foreground">
                    • {f}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-success">Toda la documentación está cargada.</p>
          )}
        </Card>
      </div>

      <Tabs defaultValue="documentos" className="mt-8">
        <TabsList>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="finanzas">Financiero</TabsTrigger>
          <TabsTrigger value="alertas">
            Alertas{alertasPredio.length ? ` (${alertasPredio.length})` : ""}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="documentos" className="mt-6">
          <DocumentosSection predio={predio} />
        </TabsContent>
        <TabsContent value="finanzas" className="mt-6">
          <FinanzasSection predio={predio} />
        </TabsContent>
        <TabsContent value="alertas" className="mt-6 space-y-4">
          <div>
            <h2 className="text-xl">Vencimientos del predio</h2>
            <p className="text-sm text-muted-foreground">
              Calculados desde las fechas de terminación de los contratos cargados.
            </p>
          </div>
          <AlertList items={alertasPredio} showPredio={false} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
