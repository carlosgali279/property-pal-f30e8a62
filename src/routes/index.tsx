import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Building2, Search, TrendingUp, Wallet } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PredioCard } from "@/components/PredioCard";
import { NuevoPredioDialog } from "@/components/NuevoPredioDialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { alertas, balance, completitud, fmtCOP } from "@/lib/selectors";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard de predios — Portafolio Inmobiliario" },
      {
        name: "description",
        content:
          "Centraliza tus predios: completitud documental, seguimiento financiero y alertas de vencimiento de contratos en un solo tablero.",
      },
      { property: "og:title", content: "Dashboard de predios — Portafolio Inmobiliario" },
      {
        property: "og:description",
        content: "Documentos, finanzas y alertas de todos tus predios en un tablero administrativo.",
      },
    ],
  }),
  component: Dashboard,
});

const TODOS = "__todos__";

function Dashboard() {
  const { visiblePredios, documentos, movimientos, tiposDocumento, contactoById, isAdmin, viewerLabel } = useStore();
  const [q, setQ] = useState("");
  const [ciudad, setCiudad] = useState(TODOS);
  const [razon, setRazon] = useState(TODOS);
  const [prop, setProp] = useState(TODOS);

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
      (q.trim() === "" ||
        `${p.nombre} ${p.direccion} ${p.ciudad} ${p.razonSocial}`.toLowerCase().includes(q.toLowerCase())),
  );

  const bal = balance(
    movimientos.filter((m) => visiblePredios.some((p) => p.id === m.predioId)),
  );
  const incompletos = visiblePredios.filter(
    (p) => completitud(documentos, p.id, tiposDocumento).cargados < tiposDocumento.length,
  ).length;
  const alertasCount = alertas(documentos, visiblePredios).length;

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {isAdmin ? "Administración del portafolio" : `Vista de propietario · ${viewerLabel}`}
          </p>
          <h1 className="mt-1 text-3xl">Predios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {visiblePredios.length} predios {isAdmin ? "en el portafolio" : "asociados a ti"} · estado documental y
            financiero de un vistazo
          </p>
        </div>
        {isAdmin && <NuevoPredioDialog />}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <Card className="mt-4 flex flex-wrap items-center gap-3 border-warning/40 bg-warning/10 p-4">
          <AlertTriangle className="size-4 text-warning-foreground" />
          <p className="text-sm">
            <span className="font-semibold">{alertasCount} contrato(s)</span> con vencimiento en los próximos 30 días.
          </p>
          <Button asChild size="sm" variant="outline" className="ml-auto bg-card">
            <a href="/alertas">Ver alertas</a>
          </Button>
        </Card>
      )}

      <Card className="mt-6 border-border p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar predio…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="bg-card pl-9"
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
        </div>
      </Card>

      {filtrados.length === 0 ? (
        <Card className="mt-6 border-dashed p-12 text-center text-muted-foreground">
          No hay predios que coincidan con los filtros.
        </Card>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((p) => (
            <PredioCard key={p.id} predio={p} />
          ))}
        </div>
      )}
    </AppShell>
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
      <SelectTrigger className="bg-card">
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
  const cls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning-foreground" : "text-foreground";
  return (
    <Card className="gap-0 border-border p-5 shadow-[var(--shadow-card)]">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className={`mt-2 font-display text-2xl ${cls}`}>{value}</p>
    </Card>
  );
}
