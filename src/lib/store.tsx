import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  contactos as contactosMock,
  documentos as documentosMock,
  impuestos as impuestosMock,
  movimientos as movimientosMock,
  predios as prediosMock,
  razonesSociales as razonesSocialesMock,
  DOCS_SOLO_COMERCIAL,
  TIPOS_DOCUMENTO_INICIALES,
  type Contacto,
  type Documento,
  type Impuesto,
  type Movimiento,
  type Predio,
  type TipoPredio,
} from "./mock-data";

export type Viewer = { kind: "admin" } | { kind: "propietario"; contactoId: string };

interface Store {
  viewer: Viewer;
  setViewer: (v: Viewer) => void;
  isAdmin: boolean;
  viewerLabel: string;
  contactos: Contacto[];
  addContacto: (c: Omit<Contacto, "id">) => string;
  actualizarContacto: (id: string, cambios: Partial<Contacto>) => void;
  eliminarContacto: (id: string) => void;
  prediosDeContacto: (contactoId: string) => string[];
  setPrediosDeContacto: (contactoId: string, predioIds: string[]) => void;
  tiposDocumento: string[];
  docsSoloComercial: string[];
  tiposPara: (tipoPredio: TipoPredio) => string[];
  addTipoDocumento: (t: string, soloComercial?: boolean) => void;
  renombrarTipoDocumento: (anterior: string, nuevo: string, soloComercial: boolean) => void;
  eliminarTipoDocumento: (t: string) => void;
  razonesSociales: string[];
  addRazonSocial: (r: string) => void;
  renombrarRazonSocial: (anterior: string, nueva: string) => void;
  eliminarRazonSocial: (r: string) => void;
  ventanaAlertas: number;
  setVentanaAlertas: (d: number) => void;
  predios: Predio[];
  visiblePredios: Predio[];
  documentos: Documento[];
  movimientos: Movimiento[];
  impuestos: Impuesto[];
  upsertPredio: (p: Predio) => void;
  subirDocumento: (d: Omit<Documento, "id">) => void;
  eliminarDocumento: (id: string) => void;
  addMovimiento: (m: Omit<Movimiento, "id">) => void;
  eliminarMovimiento: (id: string) => void;
  addImpuesto: (i: Omit<Impuesto, "id">) => void;
  actualizarImpuesto: (id: string, cambios: Partial<Impuesto>) => void;
  eliminarImpuesto: (id: string) => void;
  contactoById: (id: string) => Contacto | undefined;
}

const StoreContext = createContext<Store | null>(null);

let seq = 1000;
const nextId = (p: string) => `${p}${++seq}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<Viewer>({ kind: "admin" });
  const [predios, setPredios] = useState<Predio[]>(prediosMock);
  const [contactos, setContactos] = useState<Contacto[]>(contactosMock);
  const [documentos, setDocumentos] = useState<Documento[]>(documentosMock);
  const [movimientos, setMovimientos] = useState<Movimiento[]>(movimientosMock);
  const [impuestos, setImpuestos] = useState<Impuesto[]>(impuestosMock);
  const [tiposDocumento, setTiposDocumento] = useState<string[]>(TIPOS_DOCUMENTO_INICIALES);
  const [docsSoloComercial, setDocsSoloComercial] = useState<string[]>(DOCS_SOLO_COMERCIAL);
  const [razonesSociales, setRazonesSociales] = useState<string[]>(razonesSocialesMock);
  const [ventanaAlertas, setVentanaAlertas] = useState(30);

  const value = useMemo<Store>(() => {
    const isAdmin = viewer.kind === "admin";
    const contactoById = (id: string) => contactos.find((c) => c.id === id);
    const visiblePredios = isAdmin
      ? predios
      : predios.filter((p) => p.contactos.some((c) => c.contactoId === (viewer as { contactoId: string }).contactoId));

    return {
      viewer,
      setViewer,
      isAdmin,
      viewerLabel: isAdmin
        ? "Admin"
        : (contactoById((viewer as { contactoId: string }).contactoId)?.nombre ?? "Propietario"),
      contactos,
      addContacto: (c) => {
        const id = nextId("c");
        setContactos((prev) => [...prev, { ...c, id }]);
        return id;
      },
      actualizarContacto: (id, cambios) =>
        setContactos((prev) => prev.map((c) => (c.id === id ? { ...c, ...cambios } : c))),
      eliminarContacto: (id) => {
        setContactos((prev) => prev.filter((c) => c.id !== id));
        setPredios((prev) => prev.map((p) => ({ ...p, contactos: p.contactos.filter((v) => v.contactoId !== id) })));
        setViewer((v) => (v.kind === "propietario" && v.contactoId === id ? { kind: "admin" } : v));
      },
      prediosDeContacto: (contactoId) =>
        predios.filter((p) => p.contactos.some((v) => v.contactoId === contactoId)).map((p) => p.id),
      setPrediosDeContacto: (contactoId, predioIds) =>
        setPredios((prev) =>
          prev.map((p) => {
            const tiene = p.contactos.some((v) => v.contactoId === contactoId);
            const debe = predioIds.includes(p.id);
            if (tiene === debe) return p;
            return debe
              ? { ...p, contactos: [...p.contactos, { contactoId, rol: "socio" as const }] }
              : { ...p, contactos: p.contactos.filter((v) => v.contactoId !== contactoId) };
          }),
        ),
      tiposDocumento,
      docsSoloComercial,
      tiposPara: (tipoPredio) =>
        tipoPredio === "comercial" ? tiposDocumento : tiposDocumento.filter((t) => !docsSoloComercial.includes(t)),
      addTipoDocumento: (t, soloComercial = false) => {
        setTiposDocumento((prev) => (prev.includes(t) ? prev : [...prev, t]));
        if (soloComercial) setDocsSoloComercial((prev) => (prev.includes(t) ? prev : [...prev, t]));
      },
      renombrarTipoDocumento: (anterior, nuevo, soloComercial) => {
        setTiposDocumento((prev) => prev.map((t) => (t === anterior ? nuevo : t)));
        setDocsSoloComercial((prev) => {
          const sin = prev.filter((t) => t !== anterior && t !== nuevo);
          return soloComercial ? [...sin, nuevo] : sin;
        });
        setDocumentos((prev) => prev.map((d) => (d.tipo === anterior ? { ...d, tipo: nuevo } : d)));
      },
      eliminarTipoDocumento: (t) => {
        setTiposDocumento((prev) => prev.filter((x) => x !== t));
        setDocsSoloComercial((prev) => prev.filter((x) => x !== t));
      },
      razonesSociales,
      addRazonSocial: (r) => setRazonesSociales((prev) => (prev.includes(r) ? prev : [...prev, r])),
      renombrarRazonSocial: (anterior, nueva) => {
        setRazonesSociales((prev) => prev.map((r) => (r === anterior ? nueva : r)));
        setPredios((prev) => prev.map((p) => (p.razonSocial === anterior ? { ...p, razonSocial: nueva } : p)));
      },
      eliminarRazonSocial: (r) => setRazonesSociales((prev) => prev.filter((x) => x !== r)),
      ventanaAlertas,
      setVentanaAlertas: (d) => setVentanaAlertas(Math.max(1, Math.min(365, Math.round(d) || 30))),
      predios,
      visiblePredios,
      documentos,
      movimientos,
      impuestos,
      upsertPredio: (p) =>
        setPredios((prev) =>
          prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, p],
        ),
      subirDocumento: (d) =>
        setDocumentos((prev) => [
          ...prev.filter((x) => !(x.predioId === d.predioId && x.tipo === d.tipo)),
          { ...d, id: nextId("d") },
        ]),
      eliminarDocumento: (id) => setDocumentos((prev) => prev.filter((x) => x.id !== id)),
      addMovimiento: (m) => setMovimientos((prev) => [...prev, { ...m, id: nextId("m") }]),
      eliminarMovimiento: (id) => setMovimientos((prev) => prev.filter((x) => x.id !== id)),
      addImpuesto: (i) => setImpuestos((prev) => [...prev, { ...i, id: nextId("i") }]),
      actualizarImpuesto: (id, cambios) =>
        setImpuestos((prev) => prev.map((x) => (x.id === id ? { ...x, ...cambios } : x))),
      eliminarImpuesto: (id) => setImpuestos((prev) => prev.filter((x) => x.id !== id)),
      contactoById,
    };
  }, [
    viewer,
    predios,
    contactos,
    documentos,
    movimientos,
    impuestos,
    tiposDocumento,
    docsSoloComercial,
    razonesSociales,
    ventanaAlertas,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de StoreProvider");
  return ctx;
}

export const newPredioId = () => nextId("p");
