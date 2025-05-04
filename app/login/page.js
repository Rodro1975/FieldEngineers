"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("📬 Revisa tu correo para el enlace mágico");
      setEmail(""); // 👈 Esto limpia el campo
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white text-black">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 p-6 border rounded shadow-md w-80"
      >
        <h1 className="text-2xl font-bold">Ingresa con tu correo</h1>
        <input
          type="email"
          placeholder="tucorreo@dominio.com"
          className="border px-3 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
        >
          Enviar enlace mágico
        </button>
        {message && <p className="text-sm text-green-600">{message}</p>}
      </form>
    </main>
  );
}
