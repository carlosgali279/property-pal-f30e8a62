import type { Contacto, Documento, Movimiento, Predio } from "./mock-data";
import { balance, completitud, fmtCOP, fmtFecha } from "./selectors";

interface ReportInput {
  predio: Predio;
  documentos: Documento[];
  movimientos: Movimiento[];
  tipos: string[];
  contactoById: (id: string) => Contacto | undefined;
}

const rolLabel = (r: string) => (r === "propietario_principal" ? "Propietario principal" : "Socio");

export function exportarPDF({ predio, documentos, movimientos, tipos, contactoById }: ReportInput) {
  const comp = completitud(documentos, predio.id, tipos);
  const bal = balance(movimientos, predio.id);
  const docs = documentos.filter((d) => d.predioId === predio.id);

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Reporte ${predio.nombre}</title>
<style>
  body{font-family:ui-sans-serif,system-ui,Helvetica,Arial;margin:40px;color:#12211f}
  h1{font-size:22px;margin:0 0 4px} h2{font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:#5b7a75;margin:28px 0 8px;border-bottom:1px solid #dde7e5;padding-bottom:6px}
  table{width:100%;border-collapse:collapse;font-size:12px} th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #eef3f2}
  th{background:#f4f8f7} .muted{color:#5b7a75;font-size:12px} .tot{font-weight:700}
</style></head><body>
<h1>${predio.nombre}</h1>
<div class="muted">${predio.direccion} — ${predio.ciudad} · ${predio.razonSocial} · Generado ${new Date().toLocaleString("es-CO")}</div>
<h2>Información general</h2>
<table>
  <tr><th>Estado</th><td>${predio.estado.replace("_", " ")}</td></tr>
  <tr><th>Razón social</th><td>${predio.razonSocial}</td></tr>
  <tr><th>Ubicación</th><td>${predio.direccion}, ${predio.ciudad}</td></tr>
  <tr><th>Completitud documental</th><td>${comp.cargados}/${comp.total} documentos</td></tr>
</table>
<h2>Propietarios y socios</h2>
<table><thead><tr><th>Nombre</th><th>Rol</th><th>Part.</th><th>Email</th><th>Teléfono</th></tr></thead><tbody>
${predio.contactos
  .map((v) => {
    const c = contactoById(v.contactoId);
    return `<tr><td>${c?.nombre ?? "-"}</td><td>${rolLabel(v.rol)}</td><td>${v.participacion ?? "-"}%</td><td>${c?.email ?? "-"}</td><td>${c?.telefono ?? "-"}</td></tr>`;
  })
  .join("")}
</tbody></table>
<h2>Documentos</h2>
<table><thead><tr><th>Tipo</th><th>Estado</th><th>Archivo</th><th>Fecha carga</th><th>Vigencia contrato</th></tr></thead><tbody>
${tipos
  .map((t) => {
    const d = docs.find((x) => x.tipo === t);
    const vig = d?.contrato ? `${fmtFecha(d.contrato.fechaInicio)} → ${fmtFecha(d.contrato.fechaTerminacion)} (+${d.contrato.aumentoCanon}%)` : "-";
    return `<tr><td>${t}</td><td>${d ? "Cargado" : "Faltante"}</td><td>${d?.archivo ?? "-"}</td><td>${d ? fmtFecha(d.fechaCarga) : "-"}</td><td>${vig}</td></tr>`;
  })
  .join("")}
</tbody></table>
<h2>Resumen financiero</h2>
<table>
  <tr><th>Ingresos</th><td>${fmtCOP(bal.ingresos)}</td></tr>
  <tr><th>Gastos</th><td>${fmtCOP(bal.gastos)}</td></tr>
  <tr class="tot"><th>Balance neto</th><td>${fmtCOP(bal.neto)}</td></tr>
</table>
<table style="margin-top:12px"><thead><tr><th>Fecha</th><th>Tipo</th><th>Categoría</th><th>Nota</th><th>Monto</th></tr></thead><tbody>
${bal.list
  .slice()
  .sort((a, b) => b.fecha.localeCompare(a.fecha))
  .map((m) => `<tr><td>${fmtFecha(m.fecha)}</td><td>${m.tipo}</td><td>${m.categoria}</td><td>${m.nota ?? ""}</td><td>${fmtCOP(m.monto)}</td></tr>`)
  .join("")}
</tbody></table>
<script>window.onload=()=>window.print()</script>
</body></html>`;

  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
}

function csvCell(v: string | number) {
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

export function exportarExcel({ predio, documentos, movimientos, tipos, contactoById }: ReportInput) {
  const comp = completitud(documentos, predio.id, tipos);
  const bal = balance(movimientos, predio.id);
  const docs = documentos.filter((d) => d.predioId === predio.id);
  const rows: (string | number)[][] = [
    ["REPORTE DE PREDIO"],
    ["Nombre", predio.nombre],
    ["Dirección", predio.direccion],
    ["Ciudad", predio.ciudad],
    ["Razón social", predio.razonSocial],
    ["Estado", predio.estado.replace("_", " ")],
    ["Completitud", `${comp.cargados}/${comp.total}`],
    [],
    ["PROPIETARIOS / SOCIOS"],
    ["Nombre", "Rol", "Participación %", "Email", "Teléfono"],
    ...predio.contactos.map((v) => {
      const c = contactoById(v.contactoId);
      return [c?.nombre ?? "", rolLabel(v.rol), v.participacion ?? "", c?.email ?? "", c?.telefono ?? ""];
    }),
    [],
    ["DOCUMENTOS"],
    ["Tipo", "Estado", "Archivo", "Fecha carga", "Inicio contrato", "Fin contrato", "Aumento canon %"],
    ...tipos.map((t) => {
      const d = docs.find((x) => x.tipo === t);
      return [
        t,
        d ? "Cargado" : "Faltante",
        d?.archivo ?? "",
        d?.fechaCarga ?? "",
        d?.contrato?.fechaInicio ?? "",
        d?.contrato?.fechaTerminacion ?? "",
        d?.contrato?.aumentoCanon ?? "",
      ];
    }),
    [],
    ["MOVIMIENTOS FINANCIEROS"],
    ["Fecha", "Tipo", "Categoría", "Nota", "Monto"],
    ...bal.list
      .slice()
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .map((m) => [m.fecha, m.tipo, m.categoria, m.nota ?? "", m.monto]),
    [],
    ["Total ingresos", bal.ingresos],
    ["Total gastos", bal.gastos],
    ["Balance neto", bal.neto],
  ];

  const csv = "\uFEFF" + rows.map((r) => r.map(csvCell).join(";")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reporte-${predio.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
