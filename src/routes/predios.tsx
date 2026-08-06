import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PredioCard } from "@/components/PredioCard";
import { NuevoPredioDialog } from "@/components/NuevoPredioDialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIPOS_PREDIO } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/predios")({
  head: () => ({
    meta: [
      { title: "Listado de predios — Portafolio Inmobiliario" },
      {
        name: "description",
        content:
          "Busca y filtra los predios del portafolio por ubicación, razón social, propietario y tipo de predio.",
      },
      { property: "og:title", content: "Listado de predios — Portafolio Inmobiliario" },
      {
        property: "og:description",
        content: "Tarjetas de predios con estado documental y balance financiero, con filtros y búsqueda.",
      },
    ],
  }),
  component: PrediosPage,
});

const TODOS = "__todos__";

function PrediosPage() {
  const { visiblePredios, contactoById, isAdmin, viewerLabel } = useStore();
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

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {isAdmin ? "Administración del portafolio" : `Vista de propietario · ${viewerLabel}`}
          </p>
          <h1 className="mt-1 text-3xl">Predios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {visiblePredios.length} predios {isAdmin ? "en el portafolio" : "asociados a ti"} · busca y filtra el
            listado
          </p>
        </div>
        {isAdmin && <NuevoPredioDialog />}
      </div>

      <div className="sticky top-[4.25rem] z-20 mt-6 border border-border bg-surface p-3">
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
      </div>

      {filtrados.length === 0 ? (
        <Card className="mt-6 border-dashed p-12 text-center text-muted-foreground">
          No hay predios que coincidan con los filtros.
        </Card>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((p, i) => (
            <PredioCard key={p.id} predio={p} index={i} />
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
