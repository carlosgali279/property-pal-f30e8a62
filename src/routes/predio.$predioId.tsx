import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, FileSpreadsheet, FileText, MapPin } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AlertList } from "@/components/AlertList";
import { ContactosSection } from "@/components/ContactosSection";
import { PredioResumen } from "@/components/PredioResumen";
import { DocumentosSection } from "@/components/DocumentosSection";
import { ImpuestosSection } from "@/components/ImpuestosSection";
import { FinanzasSection } from "@/components/FinanzasSection";
import { EstadoBadge } from "@/components/EstadoBadge";
import { TipoPredioBadge } from "@/components/TipoPredioBadge";
import { NuevoPredioDialog } from "@/components/NuevoPredioDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportarExcel, exportarPDF } from "@/lib/reports";
import { alertas, alertasImpuestos } from "@/lib/selectors";
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
  const { visiblePredios, documentos, movimientos, impuestos, tiposPara, contactoById, isAdmin, viewerLabel, ventanaAlertas } =
    useStore();

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
            <Link to="/predios">Volver al listado</Link>
          </Button>
        </Card>
      </AppShell>
    );
  }

  const tipos = tiposPara(predio.tipoPredio);
  const alertasPredio = predio
    ? [...alertas(documentos, [predio], ventanaAlertas * 3), ...alertasImpuestos(impuestos, [predio], ventanaAlertas * 3)].sort((a, b) => a.dias - b.dias)
    : [];

  const reportInput = { predio, documentos, movimientos, tipos, contactoById };

  return (
    <AppShell>
      <Link to="/predios" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
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

      <Tabs defaultValue="resumen" className="mt-6">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="finanzas">Financiero</TabsTrigger>
          <TabsTrigger value="impuestos">Impuestos</TabsTrigger>
          <TabsTrigger value="contactos">Contactos</TabsTrigger>
          <TabsTrigger value="alertas">
            Alertas{alertasPredio.length ? ` (${alertasPredio.length})` : ""}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="resumen" className="mt-6">
          <PredioResumen predio={predio} />
        </TabsContent>
        <TabsContent value="documentos" className="mt-6">
          <DocumentosSection predio={predio} />
        </TabsContent>
        <TabsContent value="finanzas" className="mt-6">
          <FinanzasSection predio={predio} />
        </TabsContent>
        <TabsContent value="impuestos" className="mt-6">
          <ImpuestosSection predio={predio} />
        </TabsContent>
        <TabsContent value="contactos" className="mt-6">
          <ContactosSection predio={predio} />
        </TabsContent>
        <TabsContent value="alertas" className="mt-6 space-y-4">
          <div>
            <h2 className="text-xl">Vencimientos del predio</h2>
            <p className="text-sm text-muted-foreground">
              Calculados desde las fechas de terminación de los contratos y las fechas tentativas de pago de impuestos.
            </p>
          </div>
          <AlertList items={alertasPredio} showPredio={false} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
