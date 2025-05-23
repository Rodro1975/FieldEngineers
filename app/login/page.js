// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast, Toaster } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    // 1) Intentar iniciar sesión
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(`❌ ${error.message}`);
      return;
    }

    // 2) Asegurarse de que exista el profile
    const user = data.user;
    if (user) {
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata.full_name || "",
      });
      if (upsertError) console.error("Error upserting profile:", upsertError);
    }

    // 3) Redirigir
    toast.success("¡Bienvenido!");
    router.replace("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white text-black">
      <Toaster />
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 p-6 border rounded shadow-md w-80"
      >
        <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>

        <input
          type="email"
          placeholder="tu@correo.com"
          className="border px-3 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="border px-3 py-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
