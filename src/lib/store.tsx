import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  contactos as contactosMock,
  documentos as documentosMock,
  impuestos as impuestosMock,
  movimientos as movimientosMock,
  predios as prediosMock,
  TIPOS_DOCUMENTO_INICIALES,
  type Contacto,
  type Documento,
  type Impuesto,
  type Movimiento,
  type Predio,
} from "./mock-data";

export type Viewer = { kind: "admin" } | { kind: "propietario"; contactoId: string };

interface Store {
  viewer: Viewer;
  setViewer: (v: Viewer) => void;
  isAdmin: boolean;
  viewerLabel: string;
  contactos: Contacto[];
  tiposDocumento: string[];
  addTipoDocumento: (t: string) => void;
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
  const [documentos, setDocumentos] = useState<Documento[]>(documentosMock);
  const [movimientos, setMovimientos] = useState<Movimiento[]>(movimientosMock);
  const [impuestos, setImpuestos] = useState<Impuesto[]>(impuestosMock);
  const [tiposDocumento, setTiposDocumento] = useState<string[]>(TIPOS_DOCUMENTO_INICIALES);

  const value = useMemo<Store>(() => {
    const isAdmin = viewer.kind === "admin";
    const contactoById = (id: string) => contactosMock.find((c) => c.id === id);
    const visiblePredios = isAdmin
      ? predios
      : predios.filter((p) => p.contactos.some((c) => c.contactoId === (viewer as { contactoId: string }).contactoId));

    return {
      viewer,
      setViewer,
      isAdmin,
      viewerLabel: isAdmin ? "Admin" : (contactoById((viewer as { contactoId: string }).contactoId)?.nombre ?? "Propietario"),
      contactos: contactosMock,
      tiposDocumento,
      addTipoDocumento: (t) => setTiposDocumento((prev) => (prev.includes(t) ? prev : [...prev, t])),
      predios,
      visiblePredios,
      documentos,
      movimientos,
      impuestos,
      upsertPredio: (p) =>
        setPredios((prev) => (prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, p])),
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
  }, [viewer, predios, documentos, movimientos, impuestos, tiposDocumento]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de StoreProvider");
  return ctx;
}

export const newPredioId = () => nextId("p");
