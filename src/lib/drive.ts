import { useQuery } from "@tanstack/react-query";

// Mismos valores públicos que en supabase.ts (la función de Drive se llama por fetch directo,
// no por el cliente de supabase-js, para mantenerlo simple y evitar cualquier interferencia
// del framework con fetch/Headers).
const SUPABASE_URL = "https://pohotschvvrehhwcugjx.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaG90c2NodnZyZWhod2N1Z2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxODg5NDQsImV4cCI6MjEwMzc2NDk0NH0.8vLboDuPYlN5-ibxlzyi8iZfShuCwQ95vjJN2w48_gc";

export interface DriveArchivo {
  id: string;
  nombre: string;
  modificado: string;
  link: string;
  icono?: string;
}

export interface DriveTipoDocumentos {
  drive_folder_id: string;
  archivos: DriveArchivo[];
}

export function useDocumentosDrive(folderId: string | undefined) {
  return useQuery({
    queryKey: ["drive-documentos", folderId],
    queryFn: async () => {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/drive-documentos-predio?folder_id=${encodeURIComponent(folderId!)}`,
        { headers: { Authorization: `Bearer ${ANON_KEY}` } },
      );
      if (!res.ok) throw new Error("No se pudieron cargar los documentos de Drive");
      const data = await res.json();
      return (data.tipos ?? {}) as Record<string, DriveTipoDocumentos>;
    },
    enabled: !!folderId,
    staleTime: 60_000,
    retry: 1,
  });
}
