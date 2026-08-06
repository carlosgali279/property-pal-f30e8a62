import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Building2, CalendarClock, CheckCircle2, MapPin, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Progress } from "@/components/ui/progress";
import { EstadoBadge } from "@/components/EstadoBadge";
import { TipoPredioBadge } from "@/components/TipoPredioBadge";
import type { Predio } from "@/lib/mock-data";
import { alertas, balance, completitud, fmtCOP, fmtFecha, seriePorMes } from "@/lib/selectors";
import { useStore } from "@/lib/store";

const compactCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export function PredioResumen({ predio }: { predio: Predio }) {
  const { documentos, movimientos, tiposPara, contactoById, ventanaAlertas } = useStore();

  const tipos = tiposPara(predio.tipoPredio);
  const comp = completitud(documentos, predio.id, tipos);
  const pct = comp.total === 0 ? 100 : Math.round((comp.cargados / comp.total) * 100);
  const bal = balance(movimientos, predio.id);
  const serie = seriePorMes(bal.list);
  const alertasPredio = alertas(documentos, [predio], ventanaAlertas * 3);
  const proxima = alertasPredio[0];

  const salud =
    pct === 100 && alertasPredio.length === 0
      ? { label: "Al día", stamp: "bg-primary-soft text-primary", stripe: "bg-primary" }
      : alertasPredio.some((a) => a.dias <= 15)
        ? { label: "Requiere acción", stamp: "bg-destructive-soft text-destructive", stripe: "bg-destructive" }
        : { label: "Con pendientes", stamp: "bg-warning-soft text-warning-foreground", stripe: "bg-warning" };

  const principal = predio.contactos.find((c) => c.rol === "propietario_principal");
  const contactoPrincipal = principal ? contactoById(principal.contactoId) : undefined;

  return (
    <section className="space-y-5">
      {/* Estado general del predio */}
      <div className="relative border border-border bg-surface px-4 py-2.5 pl-5">
        <span aria-hidden className={`absolute inset-y-0 left-0 w-0.5 ${salud.stripe} opacity-60`} />
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground">
              {pct === 100 ? "Documentación completa" : `${comp.faltantes.length} documento(s) por cargar`}
            </span>
            {alertasPredio.length > 0
              ? ` · ${alertasPredio.length} vencimiento(s) en los próximos 90 días`
              : " · sin vencimientos próximos"}
          </p>
          <span className={`stamp ${salud.stamp}`}>
            <span className="stamp-dot" aria-hidden />
            {salud.label}
          </span>
        </div>
      </div>


      {/* Cifras tipo libro contable */}
      <div className="ledger-grid grid-cols-2 lg:grid-cols-4">
        <div className="ledger-cell">
          <p className="label-eyebrow">Completitud</p>
          <p className="mt-1 font-display text-3xl tabular-nums">{pct}%</p>
          <Progress value={pct} className="mt-2 h-1.5" />
          <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
            {comp.cargados} de {comp.total} documentos
          </p>
        </div>
        <div className="ledger-cell">
          <p className="label-eyebrow">Ingresos 6M</p>
          <p className="mt-1 font-display text-3xl tabular-nums">${compactCOP(bal.ingresos)}</p>
          <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">{fmtCOP(bal.ingresos)}</p>
        </div>
        <div className="ledger-cell">
          <p className="label-eyebrow">Gastos 6M</p>
          <p className="mt-1 font-display text-3xl tabular-nums text-destructive">${compactCOP(bal.gastos)}</p>
          <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">{fmtCOP(bal.gastos)}</p>
        </div>
        <div className="ledger-cell">
          <p className="label-eyebrow">Balance neto 6M</p>
          <p className={`mt-1 font-display text-3xl tabular-nums ${bal.neto < 0 ? "text-destructive" : ""}`}>
            ${compactCOP(bal.neto)}
          </p>
          <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">{fmtCOP(bal.neto)}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Ingresos vs gastos */}
        <div className="border border-border bg-surface p-5 lg:col-span-2">
          <p className="label-eyebrow">Ingresos vs. gastos · últimos 6 meses</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serie} barGap={2}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) => fmtCOP(v)}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 0,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="ingresos" name="Ingresos" fill="var(--primary)" />
                <Bar dataKey="gastos" name="Gastos" fill="var(--destructive)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ficha general */}
        <div className="border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <p className="label-eyebrow">Información general</p>
          </div>
          <dl className="divide-y divide-border text-sm">
            <div className="flex items-start gap-2 px-5 py-3">
              <MapPin className="mt-0.5 size-3.5 flex-none text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Ubicación</dt>
                <dd>
                  {predio.direccion}, {predio.ciudad}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2 px-5 py-3">
              <Building2 className="mt-0.5 size-3.5 flex-none text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Razón social</dt>
                <dd>{predio.razonSocial}</dd>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 px-5 py-3">
              <EstadoBadge estado={predio.estado} />
              <TipoPredioBadge tipo={predio.tipoPredio} />
            </div>
            <div className="flex items-start gap-2 px-5 py-3">
              <Users className="mt-0.5 size-3.5 flex-none text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Propietario principal</dt>
                <dd>{contactoPrincipal?.nombre ?? "—"}</dd>
                <dd className="text-xs text-muted-foreground">
                  {predio.contactos.length} propietario(s) / socio(s)
                  {predio.arrendatario ? ` · arrendatario: ${predio.arrendatario.nombre}` : ""}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2 px-5 py-3">
              <CalendarClock className="mt-0.5 size-3.5 flex-none text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Próximo vencimiento</dt>
                <dd className="tabular-nums">
                  {proxima ? `${fmtFecha(proxima.fecha)} · ${proxima.tipo}` : "Sin vencimientos en 90 días"}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Pendientes documentales */}
        <div className="border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p className="label-eyebrow">Documentos pendientes</p>
            <span className="text-xs tabular-nums text-muted-foreground">{comp.faltantes.length}</span>
          </div>
          {comp.faltantes.length === 0 ? (
            <p className="flex items-center gap-2 px-5 py-4 text-sm text-primary">
              <CheckCircle2 className="size-4" /> Toda la documentación aplicable está cargada.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {comp.faltantes.map((f) => (
                <li key={f} className="relative flex items-center gap-2 px-5 py-3 pl-6 text-sm">
                  <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-destructive" />
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Vencimientos */}
        <div className="border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p className="label-eyebrow">Vencimientos próximos</p>
            <span className="text-xs tabular-nums text-muted-foreground">{alertasPredio.length}</span>
          </div>
          {alertasPredio.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">Sin contratos por vencer en los próximos 90 días.</p>
          ) : (
            <ul className="divide-y divide-border">
              {alertasPredio.slice(0, 4).map((a) => (
                <li key={`${a.tipo}-${a.fecha}`} className="relative px-5 py-3 pl-6">
                  <span
                    aria-hidden
                    className={`absolute inset-y-0 left-0 w-1.5 ${
                      a.severidad === "vencida" || a.severidad === "critica" ? "bg-destructive" : "bg-warning"
                    }`}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{a.tipo}</p>
                    <span className="flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
                      <AlertTriangle className="size-3.5" />
                      {a.dias < 0 ? `vencido hace ${Math.abs(a.dias)} d` : `en ${a.dias} d`}
                    </span>
                  </div>
                  <p className="text-xs tabular-nums text-muted-foreground">{fmtFecha(a.fecha)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Link
        to="/alertas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        Ver todos los vencimientos del portafolio <ArrowRight className="size-3.5" />
      </Link>
    </section>
  );
}
