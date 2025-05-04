"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState("Verificando enlace mágico...");

  useEffect(() => {
    const handleMagicLink = async () => {
      const hash = window.location.hash;

      if (!hash) {
        setMessage("No se encontró información de autenticación en la URL.");
        return;
      }

      const params = new URLSearchParams(hash.substring(1));

      // Comprobar si hay un error en el enlace mágico
      if (params.get("error")) {
        const errorDescription =
          params.get("error_description") || "Error desconocido";
        setMessage(
          `❌ Error en el enlace mágico: ${decodeURIComponent(
            errorDescription
          )}`
        );
        return;
      }

      // Extraer los tokens de la URL
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      const expires_at = params.get("expires_at");

      // Validar que los tokens estén presentes
      if (!access_token || !refresh_token || !expires_at) {
        setMessage("Faltan tokens en la URL de autenticación.");
        return;
      }

      // Establecer la sesión en Supabase
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
        expires_at: Number(expires_at),
      });

      if (error) {
        setMessage(`❌ Error estableciendo sesión: ${error.message}`);
        return;
      }

      // Sesión establecida, redirigir al dashboard
      router.replace("/dashboard");
    };

    handleMagicLink();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p>{message}</p>
    </main>
  );
}
