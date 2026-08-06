import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  Bell,
  LayoutGrid,
  ShieldCheck,
  Eye,
  Menu,
  Gauge,
  FileText,
  Settings,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { alertas } from "@/lib/selectors";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { viewer, setViewer, contactos, isAdmin, documentos, visiblePredios } = useStore();
  const [open, setOpen] = useState(false);
  const pendientes = alertas(documentos, visiblePredios).length;

  const value = viewer.kind === "admin" ? "admin" : `prop:${viewer.contactoId}`;

  const nav = [
    { to: "/", label: "Dashboard", icon: <Gauge className="size-4" />, exact: true },
    { to: "/predios", label: "Predios", icon: <LayoutGrid className="size-4" /> },
    { to: "/alertas", label: "Alertas", icon: <Bell className="size-4" />, count: pendientes },
    { to: "/reportes", label: "Reportes", icon: <FileText className="size-4" /> },
    { to: "/configuracion", label: "Configuración", icon: <Settings className="size-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-none bg-primary text-primary-foreground">
              <Building2 className="size-5" />
            </span>
            <span className="font-display text-lg leading-none">
              Portafolio<span className="text-muted-foreground"> / predios</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <span
              className={`stamp hidden sm:inline-flex ${isAdmin ? "bg-primary-soft text-primary" : "bg-info-soft text-info-foreground"}`}
            >
              {isAdmin ? <ShieldCheck className="size-3.5" /> : <Eye className="size-3.5" />}
              {isAdmin ? "Acceso total" : "Solo lectura"}
            </span>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Abrir menú" className="rounded-none bg-background">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[19rem] rounded-none border-l border-border bg-surface p-0">
                <div className="border-b border-border px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Navegación</p>
                  <p className="mt-1 font-display text-lg leading-none">Portafolio de predios</p>
                </div>

                <nav className="flex flex-col border-b border-border">
                  {nav.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      activeOptions={item.exact ? { exact: true } : undefined}
                      className="flex items-center gap-3 border-b border-border px-5 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-muted data-[status=active]:text-foreground"
                    >
                      {item.icon}
                      {item.label}
                      {item.count ? (
                        <span className="ml-auto border border-destructive/40 bg-destructive-soft px-1.5 text-[11px] font-bold tabular-nums text-destructive">
                          {item.count}
                        </span>
                      ) : null}
                    </Link>
                  ))}
                </nav>

                <div className="px-5 py-5">
                  <p className="label-eyebrow">Ver como</p>
                  <Select
                    value={value}
                    onValueChange={(v) =>
                      setViewer(v === "admin" ? { kind: "admin" } : { kind: "propietario", contactoId: v.slice(5) })
                    }
                  >
                    <SelectTrigger className="mt-2 w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (yo)</SelectItem>
                      {contactos.map((c) => (
                        <SelectItem key={c.id} value={`prop:${c.id}`}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {isAdmin ? "Acceso total de administración." : "Vista de solo lectura de tus predios."}
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
