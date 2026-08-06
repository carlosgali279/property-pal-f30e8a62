export type EstadoPredio = "arrendado" | "en_construccion" | "disponible" | "en_tramite";

export const ESTADOS: { value: EstadoPredio; label: string }[] = [
  { value: "arrendado", label: "Arrendado" },
  { value: "en_construccion", label: "En construcción" },
  { value: "disponible", label: "Disponible" },
  { value: "en_tramite", label: "En trámite" },
];

export type TipoPredio = "comercial" | "no_arrendado";

export const TIPOS_PREDIO: { value: TipoPredio; label: string; corto: string }[] = [
  { value: "comercial", label: "Comercial (se arrienda)", corto: "Comercial" },
  { value: "no_arrendado", label: "No arrendado (ej. finca)", corto: "No arrendado" },
];

/** Documentos que solo aplican a predios comerciales (arrendados). */
export const DOCS_SOLO_COMERCIAL = ["Contrato de arrendamiento", "Otrosí", "Contacto del arrendatario"];

/** Tipos de documento exigibles según el tipo de predio. */
export const tiposAplicables = (tipos: string[], tipoPredio: TipoPredio) =>
  tipoPredio === "comercial" ? tipos : tipos.filter((t) => !DOCS_SOLO_COMERCIAL.includes(t));

/** Categorías de ingreso disponibles según el tipo de predio. */
export const categoriasIngreso = (tipoPredio: TipoPredio) =>
  tipoPredio === "comercial" ? CATEGORIAS_INGRESO : CATEGORIAS_INGRESO.filter((c) => c === "Otros");

export type RolContacto = "propietario_principal" | "socio";

export interface Contacto {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
}

export interface VinculoContacto {
  contactoId: string;
  rol: RolContacto;
  participacion?: number;
}

export interface Documento {
  id: string;
  predioId: string;
  tipo: string;
  archivo: string;
  fechaCarga: string;
  contrato?: {
    fechaInicio: string;
    fechaTerminacion: string;
    aumentoCanon: number;
  };
}

export type TipoMovimiento = "ingreso" | "gasto";

export interface Movimiento {
  id: string;
  predioId: string;
  tipo: TipoMovimiento;
  categoria: string;
  monto: number;
  fecha: string;
  nota?: string;
}

export type RolArrendatarioContacto =
  | "representante_legal"
  | "administrativo"
  | "pagos"
  | "mantenimiento"
  | "sitio";

export const ROLES_ARRENDATARIO: { value: RolArrendatarioContacto; label: string }[] = [
  { value: "representante_legal", label: "Representante legal" },
  { value: "administrativo", label: "Administrativo / legal" },
  { value: "pagos", label: "Pagos y facturación" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "sitio", label: "Contacto en sitio" },
];

export interface ContactoArrendatario {
  id: string;
  nombre: string;
  rol: RolArrendatarioContacto;
  cargo: string;
  email: string;
  telefono: string;
  nota?: string;
}

export interface Arrendatario {
  nombre: string;
  nit: string;
  desde: string;
  contactos: ContactoArrendatario[];
}

export interface Predio {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  razonSocial: string;
  estado: EstadoPredio;
  tipoPredio: TipoPredio;
  contactos: VinculoContacto[];
  /** Solo aplica a predios comerciales (arrendados). */
  arrendatario?: Arrendatario;
}

export const TIPOS_DOCUMENTO_INICIALES = [
  "Planos",
  "Licencia de construcción",
  "Contrato de arrendamiento",
  "Otrosí",
  "Escritura del inmueble",
  "Contacto del arrendatario",
  "Cotización de mantenimientos / Facturas",
  "Contrato de construcción",
];

export const CATEGORIAS_INGRESO = ["Arriendo", "Aumento de canon", "Otros"];
export const CATEGORIAS_GASTO = ["Mantenimiento", "Impuestos", "Servicios", "Otros"];

export const contactos: Contacto[] = [
  { id: "c1", nombre: "Carlos Restrepo", email: "carlos.restrepo@correo.com", telefono: "+57 310 448 2210" },
  { id: "c2", nombre: "María Elena Vargas", email: "me.vargas@correo.com", telefono: "+57 315 772 0091" },
  { id: "c3", nombre: "Jorge Andrés Pineda", email: "japineda@correo.com", telefono: "+57 301 559 8834" },
  { id: "c4", nombre: "Inversiones Delta S.A.S.", email: "contacto@invdelta.co", telefono: "+57 604 322 1100" },
  { id: "c5", nombre: "Laura Cardona", email: "laura.cardona@correo.com", telefono: "+57 320 118 4477" },
];

export const razonesSociales = [
  "Inmobiliaria Andina S.A.S.",
  "Grupo Vargas & Cía.",
  "Constructora Delta S.A.S.",
  "Predios del Norte Ltda.",
];

export const predios: Predio[] = [
  {
    id: "p1",
    nombre: "Bodega Guayabal 42",
    direccion: "Cra. 52 #12-42",
    ciudad: "Medellín",
    razonSocial: "Inmobiliaria Andina S.A.S.",
    estado: "arrendado",
    tipoPredio: "comercial",
    contactos: [
      { contactoId: "c1", rol: "propietario_principal", participacion: 60 },
      { contactoId: "c2", rol: "socio", participacion: 40 },
    ],
    arrendatario: {
      nombre: "Logística Sur S.A.S.",
      nit: "900.412.887-4",
      desde: "2024-02-01",
      contactos: [
        { id: "a1", nombre: "Diego Ospina", rol: "representante_legal", cargo: "Gerente general", email: "d.ospina@logisticasur.co", telefono: "+57 604 511 8890", nota: "Firma contratos y otrosí." },
        { id: "a2", nombre: "Paula Betancur", rol: "pagos", cargo: "Jefe de tesorería", email: "pagos@logisticasur.co", telefono: "+57 318 220 7741", nota: "Radicación de facturas antes del día 5." },
        { id: "a3", nombre: "Héctor Ruiz", rol: "mantenimiento", cargo: "Coordinador de planta", email: "h.ruiz@logisticasur.co", telefono: "+57 312 664 0125", nota: "Autoriza ingreso de técnicos." },
      ],
    },
  },
  {
    id: "p2",
    nombre: "Local Comercial Poblado",
    direccion: "Cl. 10 #43-18",
    ciudad: "Medellín",
    razonSocial: "Grupo Vargas & Cía.",
    estado: "arrendado",
    tipoPredio: "comercial",
    contactos: [{ contactoId: "c2", rol: "propietario_principal", participacion: 100 }],
    arrendatario: {
      nombre: "Café de Origen Ltda.",
      nit: "901.220.554-1",
      desde: "2023-09-01",
      contactos: [
        { id: "a4", nombre: "Sara Molina", rol: "representante_legal", cargo: "Socia fundadora", email: "sara@cafedeorigen.co", telefono: "+57 300 774 5512" },
        { id: "a5", nombre: "Andrés Gil", rol: "sitio", cargo: "Administrador del local", email: "local.poblado@cafedeorigen.co", telefono: "+57 311 908 3320", nota: "Contacto para novedades diarias." },
      ],
    },
  },
  {
    id: "p3",
    nombre: "Lote Industrial La Estrella",
    direccion: "Vereda Peñas Blancas Km 3",
    ciudad: "La Estrella",
    razonSocial: "Constructora Delta S.A.S.",
    estado: "en_construccion",
    tipoPredio: "no_arrendado",
    contactos: [
      { contactoId: "c4", rol: "propietario_principal", participacion: 70 },
      { contactoId: "c3", rol: "socio", participacion: 30 },
    ],
  },
  {
    id: "p4",
    nombre: "Oficina 804 Torre Nogal",
    direccion: "Cra. 7 #71-52",
    ciudad: "Bogotá",
    razonSocial: "Inmobiliaria Andina S.A.S.",
    estado: "arrendado",
    tipoPredio: "comercial",
    contactos: [
      { contactoId: "c1", rol: "propietario_principal", participacion: 50 },
      { contactoId: "c5", rol: "socio", participacion: 50 },
    ],
    arrendatario: {
      nombre: "Consultora Meridiano S.A.S.",
      nit: "900.885.113-7",
      desde: "2024-07-01",
      contactos: [
        { id: "a6", nombre: "Camila Torres", rol: "administrativo", cargo: "Directora administrativa", email: "c.torres@meridiano.co", telefono: "+57 601 745 2200", nota: "Interlocutora para renovación." },
        { id: "a7", nombre: "Julián Mesa", rol: "pagos", cargo: "Analista contable", email: "facturacion@meridiano.co", telefono: "+57 320 551 9987" },
      ],
    },
  },
  {
    id: "p5",
    nombre: "Casa Lote Envigado",
    direccion: "Cl. 38 Sur #27-05",
    ciudad: "Envigado",
    razonSocial: "Predios del Norte Ltda.",
    estado: "disponible",
    tipoPredio: "no_arrendado",
    contactos: [{ contactoId: "c3", rol: "propietario_principal", participacion: 100 }],
  },
  {
    id: "p6",
    nombre: "Bodega Zona Franca",
    direccion: "Autopista Norte Km 12 Bod. 7",
    ciudad: "Rionegro",
    razonSocial: "Constructora Delta S.A.S.",
    estado: "arrendado",
    tipoPredio: "comercial",
    contactos: [
      { contactoId: "c4", rol: "propietario_principal", participacion: 80 },
      { contactoId: "c1", rol: "socio", participacion: 20 },
    ],
    arrendatario: {
      nombre: "Distribuciones Andes S.A.",
      nit: "890.331.442-2",

      desde: "2023-01-15",
      contactos: [
        { id: "a8", nombre: "Ricardo Peláez", rol: "representante_legal", cargo: "Director de operaciones", email: "r.pelaez@distandes.com", telefono: "+57 604 210 7788" },
        { id: "a9", nombre: "Natalia Arango", rol: "administrativo", cargo: "Abogada interna", email: "juridica@distandes.com", telefono: "+57 314 002 6612", nota: "Maneja otrosí y pólizas." },
        { id: "a10", nombre: "Fabián Cortés", rol: "mantenimiento", cargo: "Jefe de bodega", email: "bodega7@distandes.com", telefono: "+57 313 447 5590" },
        { id: "a11", nombre: "Mónica Zapata", rol: "pagos", cargo: "Tesorería", email: "tesoreria@distandes.com", telefono: "+57 604 210 7790" },
      ],
    },
  },
  {
    id: "p7",
    nombre: "Apartamento 501 Laureles",
    direccion: "Cra. 76 #33-21",
    ciudad: "Medellín",
    razonSocial: "Grupo Vargas & Cía.",
    estado: "en_tramite",
    tipoPredio: "no_arrendado",
    contactos: [{ contactoId: "c5", rol: "propietario_principal", participacion: 100 }],
  },
  {
    id: "p8",
    nombre: "Local 12 C.C. Cañaveral",
    direccion: "Cl. 30 #29-55 Local 12",
    ciudad: "Bucaramanga",
    razonSocial: "Predios del Norte Ltda.",
    estado: "arrendado",
    tipoPredio: "comercial",
    contactos: [
      { contactoId: "c2", rol: "propietario_principal", participacion: 55 },
      { contactoId: "c3", rol: "socio", participacion: 45 },
    ],
    arrendatario: {
      nombre: "Moda Urbana S.A.S.",
      nit: "901.556.201-9",
      desde: "2024-11-01",
      contactos: [
        { id: "a12", nombre: "Esteban Villa", rol: "representante_legal", cargo: "Gerente comercial", email: "e.villa@modaurbana.co", telefono: "+57 607 655 3311" },
        { id: "a13", nombre: "Yenny Duarte", rol: "sitio", cargo: "Jefe de tienda", email: "local12@modaurbana.co", telefono: "+57 317 220 4478", nota: "Reporta daños del local." },
      ],
    },
  },
];

const hoy = new Date();
const enDias = (d: number) => {
  const f = new Date(hoy);
  f.setDate(f.getDate() + d);
  return f.toISOString().slice(0, 10);
};

export const documentos: Documento[] = [
  { id: "d1", predioId: "p1", tipo: "Planos", archivo: "planos-guayabal42.pdf", fechaCarga: "2024-03-11" },
  { id: "d2", predioId: "p1", tipo: "Escritura del inmueble", archivo: "escritura-8842.pdf", fechaCarga: "2023-11-02" },
  { id: "d3", predioId: "p1", tipo: "Licencia de construcción", archivo: "licencia-2019-441.pdf", fechaCarga: "2024-01-20" },
  {
    id: "d4",
    predioId: "p1",
    tipo: "Contrato de arrendamiento",
    archivo: "contrato-arriendo-2024.pdf",
    fechaCarga: "2024-02-01",
    contrato: { fechaInicio: "2024-02-01", fechaTerminacion: enDias(22), aumentoCanon: 7.5 },
  },
  { id: "d5", predioId: "p1", tipo: "Contacto del arrendatario", archivo: "datos-arrendatario.docx", fechaCarga: "2024-02-01" },
  { id: "d6", predioId: "p1", tipo: "Cotización de mantenimientos / Facturas", archivo: "facturas-2025-q1.xlsx", fechaCarga: "2025-04-05" },

  { id: "d7", predioId: "p2", tipo: "Escritura del inmueble", archivo: "escritura-poblado.pdf", fechaCarga: "2022-08-14" },
  {
    id: "d8",
    predioId: "p2",
    tipo: "Contrato de arrendamiento",
    archivo: "contrato-local-poblado.pdf",
    fechaCarga: "2023-09-01",
    contrato: { fechaInicio: "2023-09-01", fechaTerminacion: enDias(120), aumentoCanon: 9.28 },
  },
  { id: "d9", predioId: "p2", tipo: "Otrosí", archivo: "otrosi-01.pdf", fechaCarga: "2024-09-01" },
  { id: "d10", predioId: "p2", tipo: "Contacto del arrendatario", archivo: "arrendatario-poblado.pdf", fechaCarga: "2023-09-02" },

  { id: "d11", predioId: "p3", tipo: "Planos", archivo: "planos-la-estrella.dwg", fechaCarga: "2025-01-15" },
  { id: "d12", predioId: "p3", tipo: "Licencia de construcción", archivo: "licencia-2025-118.pdf", fechaCarga: "2025-02-03" },
  { id: "d13", predioId: "p3", tipo: "Contrato de construcción", archivo: "contrato-obra-delta.pdf", fechaCarga: "2025-02-10" },
  { id: "d14", predioId: "p3", tipo: "Escritura del inmueble", archivo: "escritura-lote.pdf", fechaCarga: "2021-06-30" },

  { id: "d15", predioId: "p4", tipo: "Escritura del inmueble", archivo: "escritura-nogal-804.pdf", fechaCarga: "2020-05-19" },
  {
    id: "d16",
    predioId: "p4",
    tipo: "Contrato de arrendamiento",
    archivo: "contrato-oficina-804.pdf",
    fechaCarga: "2024-07-01",
    contrato: { fechaInicio: "2024-07-01", fechaTerminacion: enDias(9), aumentoCanon: 6.9 },
  },
  { id: "d17", predioId: "p4", tipo: "Planos", archivo: "planos-oficina.pdf", fechaCarga: "2020-05-19" },
  { id: "d18", predioId: "p4", tipo: "Contacto del arrendatario", archivo: "arrendatario-nogal.pdf", fechaCarga: "2024-07-02" },
  { id: "d19", predioId: "p4", tipo: "Cotización de mantenimientos / Facturas", archivo: "mantenimiento-ascensor.pdf", fechaCarga: "2025-06-11" },

  { id: "d20", predioId: "p5", tipo: "Escritura del inmueble", archivo: "escritura-envigado.pdf", fechaCarga: "2019-10-08" },
  { id: "d21", predioId: "p5", tipo: "Planos", archivo: "planos-casa-lote.pdf", fechaCarga: "2019-10-08" },

  { id: "d22", predioId: "p6", tipo: "Escritura del inmueble", archivo: "escritura-zf.pdf", fechaCarga: "2021-02-17" },
  { id: "d23", predioId: "p6", tipo: "Planos", archivo: "planos-bodega-zf.pdf", fechaCarga: "2021-03-01" },
  { id: "d24", predioId: "p6", tipo: "Licencia de construcción", archivo: "licencia-zf.pdf", fechaCarga: "2021-04-12" },
  {
    id: "d25",
    predioId: "p6",
    tipo: "Contrato de arrendamiento",
    archivo: "contrato-bodega-zf.pdf",
    fechaCarga: "2023-01-15",
    contrato: { fechaInicio: "2023-01-15", fechaTerminacion: enDias(58), aumentoCanon: 8.1 },
  },
  { id: "d26", predioId: "p6", tipo: "Otrosí", archivo: "otrosi-zf-02.pdf", fechaCarga: "2025-01-15" },
  { id: "d27", predioId: "p6", tipo: "Contacto del arrendatario", archivo: "arrendatario-zf.pdf", fechaCarga: "2023-01-16" },
  { id: "d28", predioId: "p6", tipo: "Cotización de mantenimientos / Facturas", archivo: "facturas-zf.xlsx", fechaCarga: "2025-05-20" },
  { id: "d29", predioId: "p6", tipo: "Contrato de construcción", archivo: "contrato-obra-zf.pdf", fechaCarga: "2021-04-20" },

  { id: "d30", predioId: "p7", tipo: "Escritura del inmueble", archivo: "escritura-laureles.pdf", fechaCarga: "2023-04-04" },

  { id: "d31", predioId: "p8", tipo: "Escritura del inmueble", archivo: "escritura-canaveral.pdf", fechaCarga: "2022-12-01" },
  {
    id: "d32",
    predioId: "p8",
    tipo: "Contrato de arrendamiento",
    archivo: "contrato-local-12.pdf",
    fechaCarga: "2024-11-01",
    contrato: { fechaInicio: "2024-11-01", fechaTerminacion: enDias(27), aumentoCanon: 7.0 },
  },
  { id: "d33", predioId: "p8", tipo: "Contacto del arrendatario", archivo: "arrendatario-canaveral.pdf", fechaCarga: "2024-11-01" },
  { id: "d34", predioId: "p8", tipo: "Planos", archivo: "planos-local-12.pdf", fechaCarga: "2022-12-05" },
];

function mesesAtras(n: number) {
  const f = new Date(hoy);
  f.setMonth(f.getMonth() - n);
  return f.toISOString().slice(0, 10);
}

const base: Record<string, number> = { p1: 8200000, p2: 5400000, p3: 0, p4: 6900000, p5: 0, p6: 12500000, p7: 0, p8: 4300000 };

export const movimientos: Movimiento[] = (() => {
  const out: Movimiento[] = [];
  let n = 0;
  for (const p of predios) {
    const canon = base[p.id] ?? 0;
    for (let m = 5; m >= 0; m--) {
      if (canon > 0) {
        out.push({
          id: `m${++n}`,
          predioId: p.id,
          tipo: "ingreso",
          categoria: "Arriendo",
          monto: canon,
          fecha: mesesAtras(m),
          nota: "Canon mensual",
        });
        if (m === 2) {
          out.push({
            id: `m${++n}`,
            predioId: p.id,
            tipo: "ingreso",
            categoria: "Aumento de canon",
            monto: Math.round(canon * 0.07),
            fecha: mesesAtras(m),
            nota: "Reajuste anual IPC",
          });
        }
      }
      if (m % 2 === 0) {
        out.push({
          id: `m${++n}`,
          predioId: p.id,
          tipo: "gasto",
          categoria: "Mantenimiento",
          monto: 350000 + ((n * 37) % 900000),
          fecha: mesesAtras(m),
          nota: "Mantenimiento preventivo",
        });
      }
      if (m === 3) {
        out.push({ id: `m${++n}`, predioId: p.id, tipo: "gasto", categoria: "Impuestos", monto: 1250000, fecha: mesesAtras(m), nota: "Predial" });
      }
      if (m % 3 === 0) {
        out.push({ id: `m${++n}`, predioId: p.id, tipo: "gasto", categoria: "Servicios", monto: 180000 + ((n * 13) % 240000), fecha: mesesAtras(m) });
      }
    }
  }
  return out;
})();
