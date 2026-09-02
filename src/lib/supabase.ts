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

// En producción, el framework (TanStack Start) parece interferir con la función global
// `fetch` del navegador. Para evitarlo, tomamos una copia de `fetch` directamente de un
// iframe temporal y vacío — ese `fetch` nunca pasa por el código del framework.
function getNativeFetch(): typeof fetch {
  if (typeof window === "undefined") return fetch;
  try {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const nativeFetch = (iframe.contentWindow as unknown as { fetch: typeof fetch }).fetch.bind(
      iframe.contentWindow,
    );
    document.body.removeChild(iframe);
    return nativeFetch;
  } catch {
    return fetch;
  }
}

const nativeFetch = getNativeFetch();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (...args: Parameters<typeof fetch>) => nativeFetch(...args),
  },
});
