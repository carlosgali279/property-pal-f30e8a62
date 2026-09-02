import { createClient } from "@supabase/supabase-js";

// Estos son valores públicos por diseño (la "anon key" de Supabase está pensada para
// vivir en el navegador; la seguridad real la da Row Level Security en la base de datos).
// Se dejan como respaldo por si las variables de entorno no llegan a inyectarse en el
// build de producción, para no depender de esa configuración.
const FALLBACK_URL = "https://pohotschvvrehhwcugjx.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaG90c2NodnZyZWhod2N1Z2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxODg5NDQsImV4cCI6MjEwMzc2NDk0NH0.8vLboDuPYlN5-ibxlzyi8iZfShuCwQ95vjJN2w48_gc";

const supabaseUrl = (import.meta.env["VITE_SUPABASE_URL"] as string) || FALLBACK_URL;
const supabaseAnonKey = (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string) || FALLBACK_ANON_KEY;

// En producción, el framework (TanStack Start) parece reemplazar `fetch` y/o `Headers`
// globales del navegador por versiones propias, incompatibles con el `fetch` nativo.
// Tomamos ambas directamente de un iframe oculto que se mantiene vivo en segundo plano
// (nunca pasa por el código del framework).
function getNativeGlobals() {
  if (typeof window === "undefined") {
    return { fetch, Headers };
  }
  try {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);
    const win = iframe.contentWindow as unknown as { fetch: typeof fetch; Headers: typeof Headers };
    return { fetch: win.fetch.bind(win), Headers: win.Headers };
  } catch {
    return { fetch, Headers };
  }
}

const native = getNativeGlobals();

function toPlainHeaders(h: HeadersInit): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(h)) {
    for (const [k, v] of h) out[k] = v;
  } else if (h && typeof (h as { forEach?: unknown }).forEach === "function") {
    (h as Headers).forEach((value, key) => {
      out[key] = value;
    });
  } else if (h && typeof h === "object") {
    for (const k of Object.keys(h)) {
      const v = (h as Record<string, string>)[k];
      if (v !== undefined) out[k] = v;
    }
  }
  return out;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      if (!init) return native.fetch(input as string);
      const safeInit: RequestInit = { ...init };
      if (init.headers) {
        const plain = toPlainHeaders(init.headers);
        // eslint-disable-next-line no-console
        console.log("[debug supabase fetch] headers crudos:", init.headers, "-> plano:", plain);
        try {
          safeInit.headers = new native.Headers(plain);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("[debug supabase fetch] Headers() falló con:", plain, err);
          throw err;
        }
      }
      return native.fetch(input as string, safeInit);
    },
  },
});
