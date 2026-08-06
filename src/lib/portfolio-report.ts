import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { Documento, Impuesto, Movimiento, Predio, TipoPredio } from "./mock-data";
import { alertas, alertasImpuestos, balance, completitud, fmtCOP, fmtFecha, type Alerta } from "./selectors";

export interface ReporteScope {
  predios: Predio[];
  documentos: Documento[];
  movimientos: Movimiento[];
  impuestos: Impuesto[];
  tiposPara: (t: TipoPredio) => string[];
  ventanaAlertas: number;
  filtrosTexto: string[];
  alcanceLabel: string;
}

export interface FilaPredio {
  id: string;
  nombre: string;
  ciudad: string;
  razonSocial: string;
  tipoPredio: TipoPredio;
  ingresos: number;
  gastos: number;
  neto: number;
  pct: number;
  cargados: number;
  totalDocs: number;
  proximo?: { fecha: string; tipo: string; dias: number } | undefined;
}

export interface ReporteData {
  filas: FilaPredio[];
  totales: { ingresos: number; gastos: number; neto: number };
  docs: { cargados: number; total: number; pct: number; prediosIncompletos: number };
  alertas: Alerta[];
  filtrosTexto: string[];
  alcanceLabel: string;
  generado: string;
}

export function construirReporte(s: ReporteScope): ReporteData {
  const items = [
    ...alertas(s.documentos, s.predios, s.ventanaAlertas * 3),
    ...alertasImpuestos(s.impuestos, s.predios, s.ventanaAlertas * 3),
  ].sort((a, b) => a.dias - b.dias);

  const filas: FilaPredio[] = s.predios.map((p) => {
    const tipos = s.tiposPara(p.tipoPredio);
    const comp = completitud(s.documentos, p.id, tipos);
    const bal = balance(s.movimientos, p.id);
    const prox = items.find((a) => a.predioId === p.id);
    return {
      id: p.id,
      nombre: p.nombre,
      ciudad: p.ciudad,
      razonSocial: p.razonSocial,
      tipoPredio: p.tipoPredio,
      ingresos: bal.ingresos,
      gastos: bal.gastos,
      neto: bal.neto,
      cargados: comp.cargados,
      totalDocs: comp.total,
      pct: comp.total === 0 ? 100 : Math.round((comp.cargados / comp.total) * 100),
      proximo: prox ? { fecha: prox.fecha, tipo: prox.tipo, dias: prox.dias } : undefined,
    };
  });

  const totales = filas.reduce(
    (a, f) => ({ ingresos: a.ingresos + f.ingresos, gastos: a.gastos + f.gastos, neto: a.neto + f.neto }),
    { ingresos: 0, gastos: 0, neto: 0 },
  );
  const cargados = filas.reduce((a, f) => a + f.cargados, 0);
  const total = filas.reduce((a, f) => a + f.totalDocs, 0);

  return {
    filas,
    totales,
    docs: {
      cargados,
      total,
      pct: total === 0 ? 0 : Math.round((cargados / total) * 100),
      prediosIncompletos: filas.filter((f) => f.cargados < f.totalDocs).length,
    },
    alertas: items,
    filtrosTexto: s.filtrosTexto,
    alcanceLabel: s.alcanceLabel,
    generado: new Date().toLocaleString("es-CO"),
  };
}

const tipoLabel = (t: TipoPredio) => (t === "comercial" ? "Comercial" : "No arrendado");
const venc = (f: FilaPredio) =>
  f.proximo ? `${fmtFecha(f.proximo.fecha)} (${f.proximo.dias < 0 ? "vencido" : `${f.proximo.dias} d`})` : "—";

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
const stamp = () => new Date().toISOString().slice(0, 10);

export function descargarReportePDF(d: ReporteData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const ink: [number, number, number] = [38, 48, 42];
  const olive: [number, number, number] = [64, 84, 62];

  doc.setFont("times", "bold").setFontSize(18).setTextColor(...ink);
  doc.text("Reporte de portafolio de predios", 40, 50);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(110, 120, 112);
  doc.text(`${d.alcanceLabel} · Generado ${d.generado}`, 40, 66);
  doc.text(`Alcance: ${d.filtrosTexto.length ? d.filtrosTexto.join(" · ") : "Consolidado de todo el portafolio"}`, 40, 79);

  autoTable(doc, {
    startY: 96,
    head: [["Resumen consolidado", ""]],
    body: [
      ["Predios incluidos", String(d.filas.length)],
      ["Ingresos del periodo", fmtCOP(d.totales.ingresos)],
      ["Gastos del periodo", fmtCOP(d.totales.gastos)],
      ["Balance neto", fmtCOP(d.totales.neto)],
      ["Completitud documental", `${d.docs.cargados}/${d.docs.total} documentos (${d.docs.pct}%)`],
      ["Predios con documentos pendientes", String(d.docs.prediosIncompletos)],
      ["Alertas vigentes", String(d.alertas.length)],
    ],
    theme: "grid",
    styles: { font: "helvetica", fontSize: 9, textColor: ink, lineColor: [205, 210, 200] },
    headStyles: { fillColor: olive, textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: 40, right: 40 },
  });

  autoTable(doc, {
    head: [["Predio", "Ciudad", "Tipo", "Ingresos", "Gastos", "Balance", "Docs", "Próx. vencimiento"]],
    body: d.filas.map((f) => [
      f.nombre,
      f.ciudad,
      tipoLabel(f.tipoPredio),
      fmtCOP(f.ingresos),
      fmtCOP(f.gastos),
      fmtCOP(f.neto),
      `${f.pct}%`,
      venc(f),
    ]),
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, textColor: ink, lineColor: [205, 210, 200] },
    headStyles: { fillColor: olive, textColor: [255, 255, 255] },
    columnStyles: { 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" }, 6: { halign: "right" } },
    margin: { left: 40, right: 40 },
  });

  autoTable(doc, {
    head: [["Alertas de vencimiento vigentes", "", "", ""]],
    body: d.alertas.length
      ? d.alertas.map((a) => [
          a.predioNombre,
          a.tipo,
          fmtFecha(a.fecha),
          a.dias < 0 ? `Vencido hace ${Math.abs(a.dias)} d` : `En ${a.dias} d`,
        ])
      : [["Sin alertas dentro del alcance seleccionado.", "", "", ""]],
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, textColor: ink, lineColor: [205, 210, 200] },
    headStyles: { fillColor: olive, textColor: [255, 255, 255] },
    margin: { left: 40, right: 40 },
  });

  doc.save(`reporte-portafolio-${stamp()}.pdf`);
}

export function descargarReporteExcel(d: ReporteData) {
  const wb = XLSX.utils.book_new();

  const resumen = [
    ["REPORTE DE PORTAFOLIO DE PREDIOS"],
    ["Alcance", d.alcanceLabel],
    ["Filtros", d.filtrosTexto.length ? d.filtrosTexto.join(" · ") : "Consolidado de todo el portafolio"],
    ["Generado", d.generado],
    [],
    ["Predios incluidos", d.filas.length],
    ["Ingresos del periodo", d.totales.ingresos],
    ["Gastos del periodo", d.totales.gastos],
    ["Balance neto", d.totales.neto],
    ["Documentos cargados", d.docs.cargados],
    ["Documentos requeridos", d.docs.total],
    ["Completitud %", d.docs.pct],
    ["Predios con pendientes", d.docs.prediosIncompletos],
    ["Alertas vigentes", d.alertas.length],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(resumen);
  ws1["!cols"] = [{ wch: 28 }, { wch: 46 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Resumen");

  const comparativa = [
    ["Predio", "Ciudad", "Razón social", "Tipo", "Ingresos", "Gastos", "Balance", "Docs cargados", "Docs requeridos", "Completitud %", "Próximo vencimiento", "Días"],
    ...d.filas.map((f) => [
      f.nombre,
      f.ciudad,
      f.razonSocial,
      tipoLabel(f.tipoPredio),
      f.ingresos,
      f.gastos,
      f.neto,
      f.cargados,
      f.totalDocs,
      f.pct,
      f.proximo ? f.proximo.fecha : "",
      f.proximo ? f.proximo.dias : "",
    ]),
    [],
    ["TOTALES", "", "", "", d.totales.ingresos, d.totales.gastos, d.totales.neto],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(comparativa);
  ws2["!cols"] = [{ wch: 26 }, { wch: 14 }, { wch: 26 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 13 }, { wch: 14 }, { wch: 13 }, { wch: 18 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Comparativa");

  const alertasAoa = [
    ["Predio", "Concepto", "Fecha", "Días", "Severidad", "Detalle"],
    ...d.alertas.map((a) => [a.predioNombre, a.tipo, a.fecha, a.dias, a.severidad, a.detalle]),
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(alertasAoa);
  ws3["!cols"] = [{ wch: 26 }, { wch: 30 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Alertas");

  XLSX.writeFile(wb, `reporte-portafolio-${slug(d.alcanceLabel)}-${stamp()}.xlsx`);
}
