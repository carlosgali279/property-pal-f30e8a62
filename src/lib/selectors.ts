import type { Documento, Impuesto, Movimiento, Predio } from "./mock-data";

export const fmtCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export const fmtFecha = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

export const diasHasta = (iso: string) =>
  Math.ceil((new Date(iso + "T12:00:00").getTime() - Date.now()) / 86400000);

export function completitud(docs: Documento[], predioId: string, tipos: string[]) {
  const cargados = tipos.filter((t) => docs.some((d) => d.predioId === predioId && d.tipo === t));
  return { cargados: cargados.length, total: tipos.length, faltantes: tipos.filter((t) => !cargados.includes(t)) };
}

export function balance(movs: Movimiento[], predioId?: string) {
  const list = predioId ? movs.filter((m) => m.predioId === predioId) : movs;
  const ingresos = list.filter((m) => m.tipo === "ingreso").reduce((a, m) => a + m.monto, 0);
  const gastos = list.filter((m) => m.tipo === "gasto").reduce((a, m) => a + m.monto, 0);
  return { ingresos, gastos, neto: ingresos - gastos, list };
}

export function seriePorMes(movs: Movimiento[]) {
  const map = new Map<string, { mes: string; ingresos: number; gastos: number }>();
  for (const m of [...movs].sort((a, b) => a.fecha.localeCompare(b.fecha))) {
    const key = m.fecha.slice(0, 7);
    const label = new Date(key + "-01T12:00:00").toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
    const row = map.get(key) ?? { mes: label, ingresos: 0, gastos: 0 };
    if (m.tipo === "ingreso") row.ingresos += m.monto;
    else row.gastos += m.monto;
    map.set(key, row);
  }
  return [...map.values()];
}

export interface Alerta {
  predioId: string;
  predioNombre: string;
  tipo: string;
  fecha: string;
  dias: number;
  detalle: string;
  severidad: "critica" | "proxima" | "vencida";
}

export function alertas(docs: Documento[], predios: Predio[], ventanaDias = 30): Alerta[] {
  const out: Alerta[] = [];
  for (const d of docs) {
    if (!d.contrato) continue;
    const predio = predios.find((p) => p.id === d.predioId);
    if (!predio) continue;
    const dias = diasHasta(d.contrato.fechaTerminacion);
    if (dias > ventanaDias) continue;
    out.push({
      predioId: predio.id,
      predioNombre: predio.nombre,
      tipo: d.tipo,
      fecha: d.contrato.fechaTerminacion,
      dias,
      detalle: `Aumento pactado del canon: ${d.contrato.aumentoCanon}%`,
      severidad: dias < 0 ? "vencida" : dias <= 15 ? "critica" : "proxima",
    });
  }
  return out.sort((a, b) => a.dias - b.dias);
}

/** Alertas de pago de impuestos, según la fecha tentativa de pago. */
export function alertasImpuestos(imps: Impuesto[], predios: Predio[], ventanaDias = 30): Alerta[] {
  const out: Alerta[] = [];
  for (const i of imps) {
    if (i.pagado) continue;
    const predio = predios.find((p) => p.id === i.predioId);
    if (!predio) continue;
    const dias = diasHasta(i.fechaLimite);
    if (dias > ventanaDias) continue;
    out.push({
      predioId: predio.id,
      predioNombre: predio.nombre,
      tipo: `${i.tipo} ${i.periodo}`,
      fecha: i.fechaLimite,
      dias,
      detalle: `${i.archivo ? "Recibo cargado" : "Sin recibo cargado"} · ${fmtCOP(i.monto)}`,
      severidad: dias < 0 ? "vencida" : dias <= 15 ? "critica" : "proxima",
    });
  }
  return out.sort((a, b) => a.dias - b.dias);
}
