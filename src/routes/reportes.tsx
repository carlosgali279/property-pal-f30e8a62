import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AlertList } from "@/components/AlertList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIPOS_PREDIO } from "@/lib/mock-data";
import { fmtCOP, fmtFecha } from "@/lib/selectors";
import { construirReporte, descargarReporteExcel, descargarReportePDF } from "@/lib/portfolio-report";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes del portafolio — Portafolio Inmobiliario" },
      {
        name: "description",
        content:
          "Genera reportes en PDF y Excel del portafolio: consolidado financiero, completitud documental, alertas y tabla comparativa por predio.",
      },
      { property: "og:title", content: "Reportes del portafolio — Portafolio Inmobiliario" },
      {
        property: "og:description",
        content: "Reportes a demanda por ubicación, razón social, propietario o tipo de predio.",
      },
    ],
  }),
  component: ReportesPage,
});

const TODOS = "__todos__";

function ReportesPage() {
  const {
    visiblePredios,
    documentos,
    movimientos,
    impuestos,
    tiposPara,
    ventanaAlertas,
    contactoById,
    isAdmin,
    viewerLabel,
  } = useStore();

  const [q, setQ] = useState("");
  const [ciudad, setCiudad] = useState(TODOS);
  const [razon, setRazon] = useState(TODOS);
  const [prop, setProp] = useState(TODOS);
  const [tipoPredio, setTipoPredio] = useState(TODOS);

  const ciudades = useMemo(() => [...new Set(visiblePredios.map((p) => p.ciudad))].sort(), [visiblePredios]);
  const razones = useMemo(() => [...new Set(visiblePredios.map((p) => p.razonSocial))].sort(), [visiblePredios]);
  const props = useMemo(() => {
    const ids = new Set(visiblePredios.flatMap((p) => p.contactos.map((c) => c.contactoId)));
    return [...ids].map((id) => contactoById(id)!).filter(Boolean);
  }, [visiblePredios, contactoById]);

  const filtrados = visiblePredios.filter(
    (p) =>
      (ciudad === TODOS || p.ciudad === ciudad) &&
      (razon === TODOS || p.razonSocial === razon) &&
      (prop === TODOS || p.contactos.some((c) => c.contactoId === prop)) &&
      (tipoPredio === TODOS || p.tipoPredio === tipoPredio) &&
      (q.trim() === "" ||
        `${p.nombre} ${p.direccion} ${p.ciudad} ${p.razonSocial}`.toLowerCase().includes(q.toLowerCase())),
  );

  const filtrosTexto = [
    q.trim() ? `Búsqueda: “${q.trim()}”` : null,
    ciudad !== TODOS ? `Ubicación: ${ciudad}` : null,
    razon !== TODOS ? `Razón social: ${razon}` : null,
    prop !== TODOS ? `Propietario/socio: ${contactoById(prop)?.nombre ?? prop}` : null,
    tipoPredio !== TODOS ? `Tipo: ${TIPOS_PREDIO.find((t) => t.value === tipoPredio)?.corto}` : null,
  ].filter(Boolean) as string[];

  const data = construirReporte({
    predios: filtrados,
    documentos,
    movimientos,
    impuestos,
    tiposPara,
    ventanaAlertas,
    filtrosTexto,
    alcanceLabel: isAdmin ? "Portafolio completo (Admin)" : `Predios de ${viewerLabel}`,
  });

  const limpiar = () => {
    setQ("");
    setCiudad(TODOS);
    setRazon(TODOS);
    setProp(TODOS);
    setTipoPredio(TODOS);
  };

  const generar = (formato: "pdf" | "excel") => {
    if (data.filas.length === 0) {
      toast.error("No hay predios en el alcance seleccionado.");
      return;
    }
    if (formato === "pdf") descargarReportePDF(data);
    else descargarReporteExcel(data);
    toast.success(`Reporte ${formato === "pdf" ? "PDF" : "Excel"} generado`, {
      description: `${data.filas.length} predio(s) incluidos.`,
    });
  };

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {isAdmin ? "Consolidados del portafolio" : `Vista de propietario · ${viewerLabel}`}
          </p>
          <h1 className="mt-1 text-3xl">Reportes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define el alcance con los filtros y descarga el reporte en PDF o Excel.
            {!isAdmin && " El alcance está limitado a los predios asignados a ti."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => generar("pdf")}>
            <FileText className="size-4" />
            PDF
          </Button>
          <Button className="gap-2" onClick={() => generar("excel")}>
            <FileSpreadsheet className="size-4" />
            Excel
          </Button>
        </div>
      </div>

      <div className="mt-6 border border-border bg-surface p-3">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar predio…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="bg-background pl-9"
            />
          </div>
          <Filtro value={ciudad} onChange={setCiudad} placeholder="Ubicación" options={ciudades.map((c) => [c, c])} />
          <Filtro value={razon} onChange={setRazon} placeholder="Razón social" options={razones.map((r) => [r, r])} />
          <Filtro
            value={prop}
            onChange={setProp}
            placeholder="Propietario / socio"
            options={props.map((c) => [c.id, c.nombre])}
          />
          <Filtro
            value={tipoPredio}
            onChange={setTipoPredio}
            placeholder="Tipo de predio"
            options={TIPOS_PREDIO.map((t) => [t.value, t.label] as [string, string])}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs">
          <span className="label-eyebrow">Alcance</span>
          {filtrosTexto.length === 0 ? (
            <span className="stamp bg-info-soft text-info-foreground">Consolidado de todo el portafolio</span>
          ) : (
            filtrosTexto.map((f) => (
              <span key={f} className="stamp bg-primary-soft text-primary">
                {f}
              </span>
            ))
          )}
          {filtrosTexto.length > 0 && (
            <button onClick={limpiar} className="ml-auto text-xs text-muted-foreground underline-offset-2 hover:underline">
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <h2 className="mt-8 text-lg">Resumen consolidado</h2>
      <div className="ledger-grid mt-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Predios incluidos" value={String(data.filas.length)} />
        <Kpi label="Ingresos del periodo" value={fmtCOP(data.totales.ingresos)} />
        <Kpi label="Gastos del periodo" value={fmtCOP(data.totales.gastos)} />
        <Kpi label="Balance neto" value={fmtCOP(data.totales.neto)} />
      </div>

      <div className="ledger-grid mt-px sm:grid-cols-3">
        <Kpi label="Completitud documental" value={`${data.docs.pct}%`} hint={`${data.docs.cargados}/${data.docs.total} documentos`} />
        <Kpi label="Predios con pendientes" value={String(data.docs.prediosIncompletos)} hint="Documentos faltantes" />
        <Kpi label="Alertas vigentes" value={String(data.alertas.length)} hint={`Ventana de ${ventanaAlertas * 3} días`} />
      </div>

      <h2 className="mt-10 text-lg">Tabla comparativa por predio</h2>
      {data.filas.length === 0 ? (
        <Card className="mt-3 border-dashed p-12 text-center text-muted-foreground">
          Ningún predio coincide con el alcance seleccionado.
        </Card>
      ) : (
        <div className="mt-3 overflow-x-auto border border-border">
          <table className="w-full min-w-[54rem] text-sm">
            <thead>
              <tr className="bg-muted text-left text-xs uppercase tracking-[0.1em] text-muted-foreground">
                <th className="px-3 py-2.5 font-semibold">Predio</th>
                <th className="px-3 py-2.5 font-semibold">Tipo</th>
                <th className="px-3 py-2.5 text-right font-semibold">Ingresos</th>
                <th className="px-3 py-2.5 text-right font-semibold">Gastos</th>
                <th className="px-3 py-2.5 text-right font-semibold">Balance</th>
                <th className="px-3 py-2.5 text-right font-semibold">Docs</th>
                <th className="px-3 py-2.5 font-semibold">Próx. vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {data.filas.map((f) => (
                <tr key={f.id} className="border-t border-border bg-surface">
                  <td className="px-3 py-2.5">
                    <span className="font-medium">{f.nombre}</span>
                    <span className="block text-xs text-muted-foreground">
                      {f.ciudad} · {f.razonSocial}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    {f.tipoPredio === "comercial" ? "Comercial" : "No arrendado"}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmtCOP(f.ingresos)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-destructive">{fmtCOP(f.gastos)}</td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{fmtCOP(f.neto)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {f.pct}%
                    <span className="block text-xs text-muted-foreground">
                      {f.cargados}/{f.totalDocs}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {f.proximo ? (
                      <>
                        <span className="block">{fmtFecha(f.proximo.fecha)}</span>
                        <span className={f.proximo.dias < 0 ? "text-destructive" : "text-muted-foreground"}>
                          {f.proximo.dias < 0 ? `Vencido hace ${Math.abs(f.proximo.dias)} d` : `En ${f.proximo.dias} d`}
                          {" · "}
                          {f.proximo.tipo}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Sin vencimientos</span>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-foreground/20 bg-muted font-semibold">
                <td className="px-3 py-2.5" colSpan={2}>
                  Totales
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{fmtCOP(data.totales.ingresos)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{fmtCOP(data.totales.gastos)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{fmtCOP(data.totales.neto)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{data.docs.pct}%</td>
                <td className="px-3 py-2.5" />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-10 text-lg">Alertas de vencimiento en el alcance</h2>
      <div className="mt-3">
        <AlertList items={data.alertas} />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3 border border-border bg-muted p-4">
        <Download className="size-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          El reporte se genera y se descarga en el momento con los datos filtrados.
        </p>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => generar("pdf")}>
            <FileText className="size-4" />
            Descargar PDF
          </Button>
          <Button className="gap-2" onClick={() => generar("excel")}>
            <FileSpreadsheet className="size-4" />
            Descargar Excel
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-surface p-4">
      <p className="label-eyebrow">{label}</p>
      <p className="mt-2 font-display text-2xl tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Filtro({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-background">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TODOS}>{placeholder}: todos</SelectItem>
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
