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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
