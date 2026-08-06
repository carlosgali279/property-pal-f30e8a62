import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Building, Check, FileStack, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TIPOS_PREDIO } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración — Portafolio Inmobiliario" },
      {
        name: "description",
        content:
          "Administra los propietarios del selector de vista, los tipos de documento por tipo de predio, la ventana de alertas y las razones sociales.",
      },
      { property: "og:title", content: "Configuración — Portafolio Inmobiliario" },
      {
        property: "og:description",
        content: "Roles y accesos simulados, catálogos de documentos y razones sociales, y ventana de alertas.",
      },
    ],
  }),
  component: ConfiguracionPage,
});

function ConfiguracionPage() {
  return (
    <AppShell>
      <div className="border-b border-border pb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Preferencias</p>
        <h1 className="mt-1 text-3xl">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra permisos simulados y catálogos del portafolio. No incluye credenciales ni autenticación real.
        </p>
      </div>

      <Tabs defaultValue="roles" className="mt-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start rounded-none border border-border bg-muted p-0">
          <Tab value="roles" icon={<Users className="size-4" />} label="Roles y accesos" />
          <Tab value="docs" icon={<FileStack className="size-4" />} label="Tipos de documento" />
          <Tab value="alertas" icon={<Bell className="size-4" />} label="Ventana de alertas" />
          <Tab value="razones" icon={<Building className="size-4" />} label="Razones sociales" />
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <RolesPanel />
        </TabsContent>
        <TabsContent value="docs" className="mt-6">
          <DocumentosPanel />
        </TabsContent>
        <TabsContent value="alertas" className="mt-6">
          <AlertasPanel />
        </TabsContent>
        <TabsContent value="razones" className="mt-6">
          <RazonesPanel />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Tab({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="gap-2 rounded-none border-r border-border px-4 py-2.5 text-sm data-[state=active]:bg-surface data-[state=active]:shadow-none"
    >
      {icon}
      {label}
    </TabsTrigger>
  );
}

function SectionHead({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border-b border-border pb-3">
      <h2 className="text-lg">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

/* ---------------- Roles y accesos ---------------- */

function RolesPanel() {
  const { contactos, predios, addContacto, actualizarContacto, eliminarContacto, prediosDeContacto, setPrediosDeContacto } =
    useStore();
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState({ nombre: "", email: "", telefono: "" });

  return (
    <div>
      <SectionHead
        title="Personas del selector “Ver como”"
        desc="Agrega, edita o quita propietarios/socios y define qué predios puede ver cada uno. Es una lista simulada, sin login real."
      />

      <div className="mt-4 border border-border">
        {contactos.map((c, i) => {
          const asignados = prediosDeContacto(c.id);
          const abierto = editando === c.id;
          return (
            <div key={c.id} className={i > 0 ? "border-t border-border bg-surface" : "bg-surface"}>
              <div className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-48 flex-1">
                  {abierto ? (
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Input
                        value={c.nombre}
                        onChange={(e) => actualizarContacto(c.id, { nombre: e.target.value })}
                        className="bg-background"
                        placeholder="Nombre"
                      />
                      <Input
                        value={c.email}
                        onChange={(e) => actualizarContacto(c.id, { email: e.target.value })}
                        className="bg-background"
                        placeholder="Email"
                      />
                      <Input
                        value={c.telefono}
                        onChange={(e) => actualizarContacto(c.id, { telefono: e.target.value })}
                        className="bg-background"
                        placeholder="Teléfono"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="font-medium">{c.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.email} · {c.telefono}
                      </p>
                    </>
                  )}
                </div>
                <span className="stamp bg-info-soft text-info-foreground">{asignados.length} predio(s)</span>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditando(abierto ? null : c.id)}>
                  {abierto ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
                  {abierto ? "Listo" : "Editar"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive"
                  onClick={() => {
                    eliminarContacto(c.id);
                    toast.success(`${c.nombre} fue removido de la lista`);
                  }}
                >
                  <Trash2 className="size-3.5" />
                  Quitar
                </Button>
              </div>

              {abierto && (
                <div className="border-t border-border bg-muted p-4">
                  <p className="label-eyebrow">Predios que puede ver</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {predios.map((p) => {
                      const marcado = asignados.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-start gap-2 border border-border bg-surface p-2.5 text-sm">
                          <Checkbox
                            checked={marcado}
                            onCheckedChange={(v) =>
                              setPrediosDeContacto(
                                c.id,
                                v === true ? [...asignados, p.id] : asignados.filter((x) => x !== p.id),
                              )
                            }
                          />
                          <span>
                            {p.nombre}
                            <span className="block text-xs text-muted-foreground">{p.ciudad}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Card className="mt-4 border-border bg-muted p-4">
        <p className="label-eyebrow">Agregar propietario / socio</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          <Input
            placeholder="Nombre"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            className="bg-background"
          />
          <Input
            placeholder="Email"
            value={nuevo.email}
            onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
            className="bg-background"
          />
          <Input
            placeholder="Teléfono"
            value={nuevo.telefono}
            onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })}
            className="bg-background"
          />
          <Button
            className="gap-2"
            onClick={() => {
              if (!nuevo.nombre.trim()) { toast.error("Escribe un nombre."); return; }
              const id = addContacto({
                nombre: nuevo.nombre.trim(),
                email: nuevo.email.trim(),
                telefono: nuevo.telefono.trim(),
              });
              setNuevo({ nombre: "", email: "", telefono: "" });
              setEditando(id);
              toast.success("Persona agregada", { description: "Asigna los predios que puede ver." });
            }}
          >
            <Plus className="size-4" />
            Agregar
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Tipos de documento ---------------- */

function DocumentosPanel() {
  const { tiposDocumento, docsSoloComercial, addTipoDocumento, renombrarTipoDocumento, eliminarTipoDocumento } =
    useStore();
  const [editando, setEditando] = useState<string | null>(null);
  const [borrador, setBorrador] = useState("");
  const [nuevo, setNuevo] = useState("");
  const [nuevoSolo, setNuevoSolo] = useState(false);

  return (
    <div>
      <SectionHead
        title="Tipos de documento por categoría de predio"
        desc="Los documentos marcados como “Solo comercial” no se exigen ni se muestran como pendientes en predios no arrendados."
      />

      <div className="mt-4 border border-border">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 bg-muted px-4 py-2.5 text-xs uppercase tracking-[0.1em] text-muted-foreground">
          <span>Tipo de documento</span>
          <span>Aplica a</span>
          <span />
        </div>
        {tiposDocumento.map((t) => {
          const solo = docsSoloComercial.includes(t);
          const abierto = editando === t;
          return (
            <div key={t} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-border bg-surface px-4 py-3">
              {abierto ? (
                <Input value={borrador} onChange={(e) => setBorrador(e.target.value)} className="bg-background" />
              ) : (
                <span className="text-sm">{t}</span>
              )}
              <button
                onClick={() => renombrarTipoDocumento(t, t, !solo)}
                className={`stamp ${solo ? "bg-primary-soft text-primary" : "bg-neutral-soft text-muted-foreground"}`}
                title="Cambiar aplicabilidad"
              >
                {solo ? "Solo comercial" : "Ambos tipos"}
              </button>
              <div className="flex gap-2">
                {abierto ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => {
                        const nombre = borrador.trim();
                        if (!nombre) { toast.error("El nombre no puede estar vacío."); return; }
                        renombrarTipoDocumento(t, nombre, solo);
                        setEditando(null);
                        toast.success("Tipo de documento actualizado");
                      }}
                    >
                      <Check className="size-3.5" />
                      Guardar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditando(null)}>
                      <X className="size-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => {
                        setEditando(t);
                        setBorrador(t);
                      }}
                    >
                      <Pencil className="size-3.5" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-destructive"
                      onClick={() => {
                        eliminarTipoDocumento(t);
                        toast.success("Tipo de documento eliminado");
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="ledger-grid mt-6 sm:grid-cols-2">
        {TIPOS_PREDIO.map((tp) => {
          const lista =
            tp.value === "comercial" ? tiposDocumento : tiposDocumento.filter((t) => !docsSoloComercial.includes(t));
          return (
            <div key={tp.value} className="bg-surface p-4">
              <p className="label-eyebrow">{tp.label}</p>
              <p className="mt-2 font-display text-2xl tabular-nums">{lista.length} documentos exigidos</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {lista.map((t) => (
                  <li key={t}>· {t}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <Card className="mt-6 border-border bg-muted p-4">
        <p className="label-eyebrow">Agregar tipo de documento</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Ej. Certificado de tradición y libertad"
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            className="min-w-64 flex-1 bg-background"
          />
          <div className="flex items-center gap-2">
            <Switch id="solo-comercial" checked={nuevoSolo} onCheckedChange={setNuevoSolo} />
            <Label htmlFor="solo-comercial" className="text-sm">
              Solo comercial
            </Label>
          </div>
          <Button
            className="gap-2"
            onClick={() => {
              const nombre = nuevo.trim();
              if (!nombre) { toast.error("Escribe el nombre del documento."); return; }
              addTipoDocumento(nombre, nuevoSolo);
              setNuevo("");
              setNuevoSolo(false);
              toast.success("Tipo de documento agregado");
            }}
          >
            <Plus className="size-4" />
            Agregar
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Ventana de alertas ---------------- */

function AlertasPanel() {
  const { ventanaAlertas, setVentanaAlertas } = useStore();
  const [valor, setValor] = useState(String(ventanaAlertas));

  return (
    <div>
      <SectionHead
        title="Ventana de alertas"
        desc="Define con cuántos días de anticipación se avisa de un vencimiento. Afecta el dashboard, la página de Alertas y el resumen de cada predio."
      />

      <Card className="mt-4 border-border bg-surface p-6">
        <Label htmlFor="ventana" className="label-eyebrow">
          Avisar X días antes del vencimiento
        </Label>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Input
            id="ventana"
            type="number"
            min={1}
            max={365}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-32 bg-background tabular-nums"
          />
          <Button
            onClick={() => {
              const n = Number(valor);
              if (!n || n < 1) { toast.error("Ingresa un número de días válido."); return; }
              setVentanaAlertas(n);
              toast.success(`Ahora se avisa con ${Math.round(n)} días de anticipación`);
            }}
          >
            Guardar
          </Button>
          <div className="flex gap-2">
            {[15, 30, 45, 60].map((d) => (
              <button
                key={d}
                onClick={() => {
                  setValor(String(d));
                  setVentanaAlertas(d);
                }}
                className={`stamp ${ventanaAlertas === d ? "bg-primary-soft text-primary" : "bg-neutral-soft text-muted-foreground"}`}
              >
                {d} días
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Valor actual: <strong className="text-foreground tabular-nums">{ventanaAlertas} días</strong> para el conteo de
          alertas urgentes; los listados muestran hasta{" "}
          <strong className="text-foreground tabular-nums">{ventanaAlertas * 3} días</strong> hacia adelante.
        </p>
      </Card>
    </div>
  );
}

/* ---------------- Razones sociales ---------------- */

function RazonesPanel() {
  const { razonesSociales, addRazonSocial, renombrarRazonSocial, eliminarRazonSocial, predios } = useStore();
  const [editando, setEditando] = useState<string | null>(null);
  const [borrador, setBorrador] = useState("");
  const [nueva, setNueva] = useState("");

  return (
    <div>
      <SectionHead
        title="Razones sociales"
        desc="Lista maestra usada al crear o editar predios. Al renombrar una razón social se actualizan los predios asociados."
      />

      <div className="mt-4 border border-border">
        {razonesSociales.map((r, i) => {
          const usados = predios.filter((p) => p.razonSocial === r).length;
          const abierto = editando === r;
          return (
            <div
              key={r}
              className={`flex flex-wrap items-center gap-3 bg-surface p-4 ${i > 0 ? "border-t border-border" : ""}`}
            >
              {abierto ? (
                <Input
                  value={borrador}
                  onChange={(e) => setBorrador(e.target.value)}
                  className="min-w-64 flex-1 bg-background"
                />
              ) : (
                <span className="min-w-64 flex-1 text-sm font-medium">{r}</span>
              )}
              <span className="stamp bg-neutral-soft text-muted-foreground">{usados} predio(s)</span>
              {abierto ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => {
                      const nombre = borrador.trim();
                      if (!nombre) { toast.error("El nombre no puede estar vacío."); return; }
                      renombrarRazonSocial(r, nombre);
                      setEditando(null);
                      toast.success("Razón social actualizada");
                    }}
                  >
                    <Check className="size-3.5" />
                    Guardar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditando(null)}>
                    <X className="size-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => {
                      setEditando(r);
                      setBorrador(r);
                    }}
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-destructive"
                    onClick={() => {
                      if (usados > 0) { toast.error("No se puede quitar: hay predios asociados."); return; }
                      eliminarRazonSocial(r);
                      toast.success("Razón social eliminada");
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <Card className="mt-4 border-border bg-muted p-4">
        <p className="label-eyebrow">Agregar razón social</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Input
            placeholder="Ej. Inversiones El Roble S.A.S."
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            className="min-w-64 flex-1 bg-background"
          />
          <Button
            className="gap-2"
            onClick={() => {
              const nombre = nueva.trim();
              if (!nombre) { toast.error("Escribe una razón social."); return; }
              addRazonSocial(nombre);
              setNueva("");
              toast.success("Razón social agregada");
            }}
          >
            <Plus className="size-4" />
            Agregar
          </Button>
        </div>
      </Card>
    </div>
  );
}
