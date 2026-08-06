import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Building2, TrendingUp, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TIPOS_PREDIO, tiposAplicables } from "@/lib/mock-data";
import { alertas, alertasImpuestos, balance, completitud, fmtCOP, fmtFecha, seriePorMes } from "@/lib/selectors";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard del portafolio — Portafolio Inmobiliario" },
      {
        name: "description",
        content:
          "Indicadores generales del portafolio: completitud documental, ingresos y gastos de los últimos 6 meses y alertas de vencimiento.",
      },
      { property: "og:title", content: "Dashboard del portafolio — Portafolio Inmobiliario" },
      {
        property: "og:description",
        content: "KPIs, balance de 6 meses, completitud por tipo de predio y vencimientos más urgentes.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { visiblePredios, documentos, movimientos, impuestos, tiposDocumento, isAdmin, viewerLabel } = useStore();

  const movsVisibles = movimientos.filter((m) => visiblePredios.some((p) => p.id === m.predioId));
  const bal = balance(movsVisibles);
  const serie = seriePorMes(movsVisibles);

  const incompletos = visiblePredios.filter((p) => {
    const tipos = tiposAplicables(tiposDocumento, p.tipoPredio);
    return completitud(documentos, p.id, tipos).cargados < tipos.length;
  }).length;

  const items = [...alertas(documentos, visiblePredios, 90), ...alertasImpuestos(impuestos, visiblePredios, 90)].sort(
    (a, b) => a.dias - b.dias,
  );
  const alertasCount = items.filter((a) => a.dias <= 30).length;
  const urgentes = items.slice(0, 4);

  const porTipo = TIPOS_PREDIO.map((t) => {
    const lista = visiblePredios.filter((p) => p.tipoPredio === t.value);
    let cargados = 0;
    let total = 0;
    for (const p of lista) {
      const tipos = tiposAplicables(tiposDocumento, p.tipoPredio);
      const c = completitud(documentos, p.id, tipos);
      cargados += c.cargados;
      total += tipos.length;
    }
    return { ...t, predios: lista.length, pct: total === 0 ? 0 : Math.round((cargados / total) * 100) };
  });

  return (
    <AppShell>
      <div className="border-b border-border pb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {isAdmin ? "Administración del portafolio" : `Vista de propietario · ${viewerLabel}`}
        </p>
        <h1 className="mt-1 text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estado general del portafolio: documentos, finanzas y vencimientos.
        </p>
      </div>

      <div className="ledger-grid mt-7 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<Building2 className="size-4" />} label="Predios" value={String(visiblePredios.length)} />
        <Kpi
          icon={<AlertTriangle className="size-4" />}
          label="Docs. incompletos"
          value={String(incompletos)}
          tone="warning"
        />
        <Kpi icon={<TrendingUp className="size-4" />} label="Ingresos 6m" value={fmtCOP(bal.ingresos)} tone="success" />
        <Kpi icon={<Wallet className="size-4" />} label="Balance neto 6m" value={fmtCOP(bal.neto)} />
      </div>

      {alertasCount > 0 && (
        <div className="rise-in relative mt-5 flex flex-wrap items-center gap-4 border border-border bg-warning-soft p-4 pl-6">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-warning" />
          <AlertTriangle className="size-4 shrink-0 text-warning-foreground" />
          <p className="text-sm text-warning-foreground">
            <span className="font-semibold">{alertasCount} vencimiento(s)</span> de contratos e impuestos en los próximos 30
            días.
          </p>
          <Button asChild size="sm" variant="outline" className="ml-auto bg-surface">
            <Link to="/alertas">Ver alertas</Link>
          </Button>
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="border-border p-5 lg:col-span-2">
          <p className="label-eyebrow">Ingresos vs. gastos · últimos 6 meses</p>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serie}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="mes"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${Math.round(v / 1_000_000)}M`}
                />
                <Tooltip
                  formatter={(v) => fmtCOP(Number(v))}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 0,
                    color: "var(--foreground)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar name="Ingresos" dataKey="ingresos" fill="var(--chart-1)" radius={0} />
                <Bar name="Gastos" dataKey="gastos" fill="var(--chart-2)" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border p-5">
          <p className="label-eyebrow">Completitud documental por tipo</p>
          <ul className="mt-4 space-y-5">
            {porTipo.map((t) => (
              <li key={t.value}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium">{t.corto}</span>
                  <span className="font-display text-xl tabular-nums">{t.pct}%</span>
                </div>
                <Progress value={t.pct} className="mt-2 h-2" />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {t.predios} predio(s) · {t.label}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <h2 className="mt-10 text-lg">Vencimientos más urgentes</h2>
      {urgentes.length === 0 ? (
        <Card className="mt-3 border-dashed border-border bg-muted p-6 text-center text-sm text-muted-foreground">
          Sin vencimientos en los próximos 90 días.
        </Card>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {urgentes.map((a, i) => (
            <Link
              key={`${a.predioId}-${a.tipo}-${i}`}
              to="/predio/$predioId"
              params={{ predioId: a.predioId }}
              className="relative border border-border bg-surface p-4 pl-6 transition-colors hover:bg-muted"
            >
              <span
                aria-hidden
                className={`absolute inset-y-0 left-0 w-1.5 ${a.dias <= 15 ? "bg-destructive" : "bg-warning"}`}
              />
              <span
                className={`stamp ${a.dias <= 15 ? "bg-destructive-soft text-destructive" : "bg-warning-soft text-warning-foreground"}`}
              >
                <span className="stamp-dot" aria-hidden />
                {a.dias < 0 ? `Vencido hace ${Math.abs(a.dias)} días` : `En ${a.dias} días`}
              </span>
              <p className="mt-2 font-display text-lg leading-tight">{a.predioNombre}</p>
              <p className="mt-1 text-sm text-muted-foreground">{a.tipo}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-primary">
                Termina el {fmtFecha(a.fecha)} <ArrowRight className="size-3.5" />
              </p>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function Kpi({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "success" | "warning";
}) {
  const cls = tone === "success" ? "text-primary" : tone === "warning" ? "text-warning-foreground" : "text-foreground";
  return (
    <div className="ledger-cell">
      <p className="label-eyebrow flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </p>
      <p className={`mt-2.5 font-display text-[1.75rem] leading-none tabular-nums ${cls}`}>{value}</p>
    </div>
  );
}
