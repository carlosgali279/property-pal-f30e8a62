import { Link } from "@tanstack/react-router";
import { Building2, Bell, LayoutGrid, ShieldCheck, Eye } from "lucide-react";
import { useStore } from "@/lib/store";
import { alertas } from "@/lib/selectors";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { viewer, setViewer, contactos, isAdmin, documentos, visiblePredios } = useStore();
  const pendientes = alertas(documentos, visiblePredios).length;

  const value = viewer.kind === "admin" ? "admin" : `prop:${viewer.contactoId}`;

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

          <nav className="ml-2 hidden items-center gap-1 md:flex">
            <NavItem to="/" icon={<LayoutGrid className="size-4" />} label="Predios" />
            <NavItem to="/alertas" icon={<Bell className="size-4" />} label="Alertas" count={pendientes} />
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span
              className={`stamp hidden sm:inline-flex ${isAdmin ? "bg-primary-soft text-primary" : "bg-info-soft text-info-foreground"}`}
            >
              {isAdmin ? <ShieldCheck className="size-3.5" /> : <Eye className="size-3.5" />}
              {isAdmin ? "Acceso total" : "Solo lectura"}
            </span>

            <div className="flex items-center gap-2">
              <span className="hidden text-xs uppercase tracking-wider text-muted-foreground sm:inline">Ver como</span>
              <Select
                value={value}
                onValueChange={(v) =>
                  setViewer(v === "admin" ? { kind: "admin" } : { kind: "propietario", contactoId: v.slice(5) })
                }
              >
                <SelectTrigger className="w-[210px] bg-background">

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
            </div>
          </div>
        </div>
        <nav className="flex items-center gap-1 border-t border-border px-4 py-1.5 md:hidden">
          <NavItem to="/" icon={<LayoutGrid className="size-4" />} label="Predios" />
          <NavItem to="/alertas" icon={<Bell className="size-4" />} label="Alertas" count={pendientes} />
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

function NavItem({ to, icon, label, count }: { to: string; icon: ReactNode; label: string; count?: number }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="flex items-center gap-2 rounded-none border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-border data-[status=active]:bg-muted data-[status=active]:text-foreground"
    >
      {icon}
      {label}
      {count ? (
        <span className="border border-destructive/40 bg-destructive-soft px-1.5 text-[11px] font-bold tabular-nums text-destructive">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

