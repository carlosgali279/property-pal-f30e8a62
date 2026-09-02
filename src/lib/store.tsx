import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "./supabase";
import { LoginScreen } from "@/components/LoginScreen";
import {
  DOCS_SOLO_COMERCIAL as DOCS_SOLO_COMERCIAL_FALLBACK,
  TIPOS_DOCUMENTO_INICIALES,
  type Contacto,
  type ContactoArrendatario,
  type Documento,
  type Impuesto,
  type Movimiento,
  type Predio,
  type TipoPredio,
  type VinculoContacto,
} from "./mock-data";

export type Viewer = { kind: "admin" } | { kind: "propietario"; contactoId: string };

interface Store {
  viewer: Viewer;
  setViewer: (v: Viewer) => void;
  isAdmin: boolean;
  isRealAdmin: boolean;
  viewerLabel: string;
  signOut: () => void;
  contactos: Contacto[];
  addContacto: (c: Omit<Contacto, "id">) => Promise<string>;
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

export const newPredioId = () => crypto.randomUUID();

function onErr(label: string) {
  return (err: unknown) => {
    console.error(label, err);
    toast.error(`No se pudo completar: ${label}`);
  };
}

/* ── Mapeo fila de Supabase -> tipos del front ───────────────────────────── */

function mapPredio(row: any): Predio {
  const contactos: VinculoContacto[] = (row.predio_contactos ?? []).map((pc: any) => ({
    contactoId: pc.contacto_id,
    rol: pc.rol,
    participacion: pc.participacion ?? undefined,
  }));

  const arrendatarioContactos: ContactoArrendatario[] = (row.arrendatario_contactos ?? []).map((ac: any) => ({
    id: ac.id,
    nombre: ac.nombre,
    rol: ac.rol,
    cargo: ac.cargo ?? "",
    email: ac.email ?? "",
    telefono: ac.telefono ?? "",
    nota: ac.nota ?? undefined,
  }));

  const predio: Predio = {
    id: row.id,
    nombre: row.nombre,
    direccion: row.direccion ?? "",
    ciudad: row.ciudad ?? "",
    razonSocial: row.razon_social ?? "",
    estado: row.estado ?? "en_tramite",
    tipoPredio: row.tipo_predio,
    contactos,
  };
  if (row.arrendatario_nombre) {
    predio.arrendatario = {
      nombre: row.arrendatario_nombre,
      nit: row.arrendatario_nit ?? "",
      desde: row.arrendatario_desde ?? "",
      contactos: arrendatarioContactos,
    };
  }
  if (row.codigo_lote) predio.codigoLote = row.codigo_lote;
  if (row.ubicacion) predio.ubicacion = row.ubicacion;
  if (row.notas) predio.notas = row.notas;
  if (row.drive_folder_id) predio.driveFolderId = row.drive_folder_id;
  return predio;
}

function mapDocumento(row: any): Documento {
  const documento: Documento = {
    id: row.id,
    predioId: row.predio_id,
    tipo: row.tipo,
    archivo: row.archivo ?? "",
    fechaCarga: row.fecha_carga,
  };
  if (row.contrato_fecha_inicio) {
    documento.contrato = {
      fechaInicio: row.contrato_fecha_inicio,
      fechaTerminacion: row.contrato_fecha_terminacion,
      aumentoCanon: row.contrato_aumento_canon ?? 0,
    };
  }
  return documento;
}

function mapMovimiento(row: any): Movimiento {
  return {
    id: row.id,
    predioId: row.predio_id,
    tipo: row.tipo,
    categoria: row.categoria,
    monto: Number(row.monto),
    fecha: row.fecha,
    nota: row.nota ?? undefined,
  };
}

function mapImpuesto(row: any): Impuesto {
  return {
    id: row.id,
    predioId: row.predio_id,
    tipo: row.tipo,
    periodo: row.periodo,
    monto: Number(row.monto),
    fechaLimite: row.fecha_limite,
    archivo: row.archivo ?? undefined,
    fechaCarga: row.fecha_carga ?? undefined,
    pagado: row.pagado,
    fechaPago: row.fecha_pago ?? undefined,
    nota: row.nota ?? undefined,
  };
}

/* ── Auth: sesión + perfil ────────────────────────────────────────────────── */

function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return session;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const session = useSession();

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (session === null) {
    return <LoginScreen />;
  }

  return <AuthenticatedStoreProvider session={session}>{children}</AuthenticatedStoreProvider>;
}

function AuthenticatedStoreProvider({ session, children }: { session: Session; children: ReactNode }) {
  const queryClient = useQueryClient();
  const userId = session.user.id;

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("rol, contacto_id")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as { rol: "admin" | "propietario"; contacto_id: string | null } | null;
    },
  });

  const contactosQuery = useQuery({
    queryKey: ["contactos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contactos").select("*").order("nombre");
      if (error) throw error;
      return (data ?? []) as Contacto[];
    },
    enabled: !!profileQuery.data,
  });

  const prediosQuery = useQuery({
    queryKey: ["predios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("predios")
        .select("*, predio_contactos(*), arrendatario_contactos(*)")
        .order("nombre");
      if (error) throw error;
      return (data ?? []).map(mapPredio);
    },
    enabled: !!profileQuery.data,
  });

  const documentosQuery = useQuery({
    queryKey: ["documentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documentos").select("*");
      if (error) throw error;
      return (data ?? []).map(mapDocumento);
    },
    enabled: !!profileQuery.data,
  });

  const movimientosQuery = useQuery({
    queryKey: ["movimientos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("movimientos").select("*").order("fecha");
      if (error) throw error;
      return (data ?? []).map(mapMovimiento);
    },
    enabled: !!profileQuery.data,
  });

  const impuestosQuery = useQuery({
    queryKey: ["impuestos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("impuestos").select("*").order("fecha_limite");
      if (error) throw error;
      return (data ?? []).map(mapImpuesto);
    },
    enabled: !!profileQuery.data,
  });

  const tiposDocumentoQuery = useQuery({
    queryKey: ["tiposDocumento"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tipos_documento").select("*");
      if (error) throw error;
      return (data ?? []) as { nombre: string; solo_comercial: boolean }[];
    },
    enabled: !!profileQuery.data,
  });

  const razonesSocialesQuery = useQuery({
    queryKey: ["razonesSociales"],
    queryFn: async () => {
      const { data, error } = await supabase.from("razones_sociales").select("*").order("nombre");
      if (error) throw error;
      return (data ?? []).map((r: any) => r.nombre as string);
    },
    enabled: !!profileQuery.data,
  });

  const [adminPreview, setAdminPreview] = useState<Viewer | null>(null);
  const [ventanaAlertas, setVentanaAlertasState] = useState(30);

  const invalidatePredios = () => queryClient.invalidateQueries({ queryKey: ["predios"] });
  const invalidateContactos = () => queryClient.invalidateQueries({ queryKey: ["contactos"] });
  const invalidateDocumentos = () => queryClient.invalidateQueries({ queryKey: ["documentos"] });
  const invalidateMovimientos = () => queryClient.invalidateQueries({ queryKey: ["movimientos"] });
  const invalidateImpuestos = () => queryClient.invalidateQueries({ queryKey: ["impuestos"] });
  const invalidateTipos = () => queryClient.invalidateQueries({ queryKey: ["tiposDocumento"] });
  const invalidateRazones = () => queryClient.invalidateQueries({ queryKey: ["razonesSociales"] });

  const mAddContacto = useMutation({
    mutationFn: async (c: Omit<Contacto, "id">) => {
      const { data, error } = await supabase.from("contactos").insert(c).select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: invalidateContactos,
    onError: onErr("crear contacto"),
  });

  const mActualizarContacto = useMutation({
    mutationFn: async ({ id, cambios }: { id: string; cambios: Partial<Contacto> }) => {
      const { error } = await supabase.from("contactos").update(cambios).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidateContactos,
    onError: onErr("actualizar contacto"),
  });

  const mEliminarContacto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contactos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateContactos();
      invalidatePredios();
    },
    onError: onErr("eliminar contacto"),
  });

  const mSetPrediosDeContacto = useMutation({
    mutationFn: async ({ contactoId, predioIds }: { contactoId: string; predioIds: string[] }) => {
      const { data: current, error: e1 } = await supabase
        .from("predio_contactos")
        .select("predio_id")
        .eq("contacto_id", contactoId);
      if (e1) throw e1;
      const currentIds = new Set((current ?? []).map((r: any) => r.predio_id as string));
      const toAdd = predioIds.filter((id) => !currentIds.has(id));
      const toRemove = [...currentIds].filter((id) => !predioIds.includes(id));
      if (toRemove.length) {
        const { error } = await supabase
          .from("predio_contactos")
          .delete()
          .eq("contacto_id", contactoId)
          .in("predio_id", toRemove);
        if (error) throw error;
      }
      if (toAdd.length) {
        const { error } = await supabase
          .from("predio_contactos")
          .insert(toAdd.map((predioId) => ({ predio_id: predioId, contacto_id: contactoId, rol: "socio" })));
        if (error) throw error;
      }
    },
    onSuccess: invalidatePredios,
    onError: onErr("actualizar predios del contacto"),
  });

  const mAddTipoDocumento = useMutation({
    mutationFn: async ({ t, soloComercial }: { t: string; soloComercial: boolean }) => {
      const { error } = await supabase
        .from("tipos_documento")
        .upsert({ nombre: t, solo_comercial: soloComercial }, { onConflict: "nombre", ignoreDuplicates: true });
      if (error) throw error;
    },
    onSuccess: invalidateTipos,
    onError: onErr("crear tipo de documento"),
  });

  const mRenombrarTipoDocumento = useMutation({
    mutationFn: async ({
      anterior,
      nuevo,
      soloComercial,
    }: {
      anterior: string;
      nuevo: string;
      soloComercial: boolean;
    }) => {
      const { error } = await supabase
        .from("tipos_documento")
        .update({ nombre: nuevo, solo_comercial: soloComercial })
        .eq("nombre", anterior);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateTipos();
      invalidateDocumentos();
    },
    onError: onErr("renombrar tipo de documento"),
  });

  const mEliminarTipoDocumento = useMutation({
    mutationFn: async (t: string) => {
      const { error } = await supabase.from("tipos_documento").delete().eq("nombre", t);
      if (error) throw error;
    },
    onSuccess: invalidateTipos,
    onError: onErr("eliminar tipo de documento (puede estar en uso)"),
  });

  const mAddRazonSocial = useMutation({
    mutationFn: async (r: string) => {
      const { error } = await supabase.from("razones_sociales").upsert({ nombre: r }, { onConflict: "nombre", ignoreDuplicates: true });
      if (error) throw error;
    },
    onSuccess: invalidateRazones,
    onError: onErr("crear razón social"),
  });

  const mRenombrarRazonSocial = useMutation({
    mutationFn: async ({ anterior, nueva }: { anterior: string; nueva: string }) => {
      const { error: e1 } = await supabase.from("razones_sociales").update({ nombre: nueva }).eq("nombre", anterior);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("predios").update({ razon_social: nueva }).eq("razon_social", anterior);
      if (e2) throw e2;
    },
    onSuccess: () => {
      invalidateRazones();
      invalidatePredios();
    },
    onError: onErr("renombrar razón social"),
  });

  const mEliminarRazonSocial = useMutation({
    mutationFn: async (r: string) => {
      const { error } = await supabase.from("razones_sociales").delete().eq("nombre", r);
      if (error) throw error;
    },
    onSuccess: invalidateRazones,
    onError: onErr("eliminar razón social"),
  });

  const mUpsertPredio = useMutation({
    mutationFn: async (p: Predio) => {
      const { error: e1 } = await supabase.from("predios").upsert({
        id: p.id,
        nombre: p.nombre,
        direccion: p.direccion || null,
        ciudad: p.ciudad || null,
        razon_social: p.razonSocial || null,
        estado: p.estado,
        tipo_predio: p.tipoPredio,
        arrendatario_nombre: p.arrendatario?.nombre ?? null,
        arrendatario_nit: p.arrendatario?.nit || null,
        arrendatario_desde: p.arrendatario?.desde || null,
      });
      if (e1) throw e1;

      const { error: e2 } = await supabase.from("predio_contactos").delete().eq("predio_id", p.id);
      if (e2) throw e2;
      if (p.contactos.length) {
        const { error } = await supabase.from("predio_contactos").insert(
          p.contactos.map((c) => ({
            predio_id: p.id,
            contacto_id: c.contactoId,
            rol: c.rol,
            participacion: c.participacion ?? null,
          })),
        );
        if (error) throw error;
      }

      const { error: e3 } = await supabase.from("arrendatario_contactos").delete().eq("predio_id", p.id);
      if (e3) throw e3;
      if (p.arrendatario?.contactos.length) {
        const { error } = await supabase.from("arrendatario_contactos").insert(
          p.arrendatario.contactos.map((c) => ({
            predio_id: p.id,
            nombre: c.nombre,
            rol: c.rol,
            cargo: c.cargo || null,
            email: c.email || null,
            telefono: c.telefono || null,
            nota: c.nota || null,
          })),
        );
        if (error) throw error;
      }
    },
    onSuccess: invalidatePredios,
    onError: onErr("guardar predio"),
  });

  const mSubirDocumento = useMutation({
    mutationFn: async (d: Omit<Documento, "id">) => {
      const { error: e1 } = await supabase.from("documentos").delete().eq("predio_id", d.predioId).eq("tipo", d.tipo);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("documentos").insert({
        predio_id: d.predioId,
        tipo: d.tipo,
        archivo: d.archivo,
        fecha_carga: d.fechaCarga,
        contrato_fecha_inicio: d.contrato?.fechaInicio ?? null,
        contrato_fecha_terminacion: d.contrato?.fechaTerminacion ?? null,
        contrato_aumento_canon: d.contrato?.aumentoCanon ?? null,
      });
      if (e2) throw e2;
    },
    onSuccess: invalidateDocumentos,
    onError: onErr("subir documento"),
  });

  const mEliminarDocumento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidateDocumentos,
    onError: onErr("eliminar documento"),
  });

  const mAddMovimiento = useMutation({
    mutationFn: async (m: Omit<Movimiento, "id">) => {
      const { error } = await supabase.from("movimientos").insert({
        predio_id: m.predioId,
        tipo: m.tipo,
        categoria: m.categoria,
        monto: m.monto,
        fecha: m.fecha,
        nota: m.nota || null,
      });
      if (error) throw error;
    },
    onSuccess: invalidateMovimientos,
    onError: onErr("registrar movimiento"),
  });

  const mEliminarMovimiento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("movimientos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidateMovimientos,
    onError: onErr("eliminar movimiento"),
  });

  const mAddImpuesto = useMutation({
    mutationFn: async (i: Omit<Impuesto, "id">) => {
      const { error } = await supabase.from("impuestos").insert({
        predio_id: i.predioId,
        tipo: i.tipo,
        periodo: i.periodo,
        monto: i.monto,
        fecha_limite: i.fechaLimite,
        archivo: i.archivo || null,
        fecha_carga: i.fechaCarga || null,
        pagado: i.pagado,
        fecha_pago: i.fechaPago || null,
        nota: i.nota || null,
      });
      if (error) throw error;
    },
    onSuccess: invalidateImpuestos,
    onError: onErr("registrar impuesto"),
  });

  const mActualizarImpuesto = useMutation({
    mutationFn: async ({ id, cambios }: { id: string; cambios: Partial<Impuesto> }) => {
      const payload: Record<string, unknown> = {};
      if (cambios.tipo !== undefined) payload["tipo"] = cambios.tipo;
      if (cambios.periodo !== undefined) payload["periodo"] = cambios.periodo;
      if (cambios.monto !== undefined) payload["monto"] = cambios.monto;
      if (cambios.fechaLimite !== undefined) payload["fecha_limite"] = cambios.fechaLimite;
      if (cambios.archivo !== undefined) payload["archivo"] = cambios.archivo;
      if (cambios.fechaCarga !== undefined) payload["fecha_carga"] = cambios.fechaCarga;
      if (cambios.pagado !== undefined) payload["pagado"] = cambios.pagado;
      if (cambios.fechaPago !== undefined) payload["fecha_pago"] = cambios.fechaPago;
      if (cambios.nota !== undefined) payload["nota"] = cambios.nota;
      const { error } = await supabase.from("impuestos").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidateImpuestos,
    onError: onErr("actualizar impuesto"),
  });

  const mEliminarImpuesto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("impuestos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidateImpuestos,
    onError: onErr("eliminar impuesto"),
  });

  const profile = profileQuery.data;
  const predios = prediosQuery.data ?? [];
  const contactos = contactosQuery.data ?? [];
  const documentos = documentosQuery.data ?? [];
  const movimientos = movimientosQuery.data ?? [];
  const impuestos = impuestosQuery.data ?? [];
  const tiposDocumentoRows = tiposDocumentoQuery.data ?? [];
  const tiposDocumento = tiposDocumentoRows.length
    ? tiposDocumentoRows.map((r) => r.nombre)
    : TIPOS_DOCUMENTO_INICIALES;
  const docsSoloComercial = tiposDocumentoRows.length
    ? tiposDocumentoRows.filter((r) => r.solo_comercial).map((r) => r.nombre)
    : DOCS_SOLO_COMERCIAL_FALLBACK;
  const razonesSociales = razonesSocialesQuery.data ?? [];

  const value = useMemo<Store | null>(() => {
    if (!profile) return null;

    const baseViewer: Viewer =
      profile.rol === "admin" ? { kind: "admin" } : { kind: "propietario", contactoId: profile.contacto_id ?? "" };
    const isReallyAdmin = profile.rol === "admin";
    const viewer = isReallyAdmin && adminPreview ? adminPreview : baseViewer;
    const isAdmin = viewer.kind === "admin";

    const contactoById = (id: string) => contactos.find((c) => c.id === id);

    const visiblePredios = isAdmin
      ? predios
      : predios.filter((p) => p.contactos.some((c) => c.contactoId === (viewer as { contactoId: string }).contactoId));

    return {
      viewer,
      setViewer: (v) => {
        if (isReallyAdmin) setAdminPreview(v);
      },
      isAdmin,
      isRealAdmin: isReallyAdmin,
      viewerLabel: isAdmin
        ? "Admin"
        : (contactoById((viewer as { contactoId: string }).contactoId)?.nombre ?? "Propietario"),
      signOut: () => {
        setAdminPreview(null);
        supabase.auth.signOut();
      },
      contactos,
      addContacto: (c) => mAddContacto.mutateAsync(c),
      actualizarContacto: (id, cambios) => mActualizarContacto.mutate({ id, cambios }),
      eliminarContacto: (id) => mEliminarContacto.mutate(id),
      prediosDeContacto: (contactoId) =>
        predios.filter((p) => p.contactos.some((v) => v.contactoId === contactoId)).map((p) => p.id),
      setPrediosDeContacto: (contactoId, predioIds) => mSetPrediosDeContacto.mutate({ contactoId, predioIds }),
      tiposDocumento,
      docsSoloComercial,
      tiposPara: (tipoPredio) =>
        tipoPredio === "comercial" ? tiposDocumento : tiposDocumento.filter((t) => !docsSoloComercial.includes(t)),
      addTipoDocumento: (t, soloComercial = false) => mAddTipoDocumento.mutate({ t, soloComercial }),
      renombrarTipoDocumento: (anterior, nuevo, soloComercial) =>
        mRenombrarTipoDocumento.mutate({ anterior, nuevo, soloComercial }),
      eliminarTipoDocumento: (t) => mEliminarTipoDocumento.mutate(t),
      razonesSociales,
      addRazonSocial: (r) => mAddRazonSocial.mutate(r),
      renombrarRazonSocial: (anterior, nueva) => mRenombrarRazonSocial.mutate({ anterior, nueva }),
      eliminarRazonSocial: (r) => mEliminarRazonSocial.mutate(r),
      ventanaAlertas,
      setVentanaAlertas: (d) => setVentanaAlertasState(Math.max(1, Math.min(365, Math.round(d) || 30))),
      predios,
      visiblePredios,
      documentos,
      movimientos,
      impuestos,
      upsertPredio: (p) => mUpsertPredio.mutate(p),
      subirDocumento: (d) => mSubirDocumento.mutate(d),
      eliminarDocumento: (id) => mEliminarDocumento.mutate(id),
      addMovimiento: (m) => mAddMovimiento.mutate(m),
      eliminarMovimiento: (id) => mEliminarMovimiento.mutate(id),
      addImpuesto: (i) => mAddImpuesto.mutate(i),
      actualizarImpuesto: (id, cambios) => mActualizarImpuesto.mutate({ id, cambios }),
      eliminarImpuesto: (id) => mEliminarImpuesto.mutate(id),
      contactoById,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, adminPreview, predios, contactos, documentos, movimientos, impuestos, tiposDocumento, docsSoloComercial, razonesSociales, ventanaAlertas]);

  if (profileQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold text-foreground">Cuenta sin perfil asignado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu usuario no tiene un perfil configurado en la plataforma. Contacta al administrador.
          </p>
          <button
            className="mt-4 text-sm text-primary underline"
            onClick={() => supabase.auth.signOut()}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de StoreProvider");
  return ctx;
}
