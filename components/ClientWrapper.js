"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientWrapper({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Aquí pones la lógica de sesión si quieres
    // Por ejemplo, si usas supabase, verifica sesión y redirige
    // Por simplicidad, simulamos carga
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <main className="flex-1 p-10 overflow-auto">
        <p>Cargando sesión…</p>
      </main>
    );
  }

  return <>{children}</>;
}
