"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const processMagicLink = async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession();

      if (error) {
        console.error("Error verificando enlace mágico:", error.message);
        router.push("/?error=auth");
      } else {
        // Todo correcto, redirige al dashboard
        router.push("/dashboard");
      }
    };

    processMagicLink();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p>Verificando enlace mágico...</p>
    </main>
  );
}
