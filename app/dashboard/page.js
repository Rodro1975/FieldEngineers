"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ShowEngineers from "@/components/ShowEngineers";

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        router.push("/login");
      } else {
        setUserEmail(session.user.email);
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex bg-white text-black">
      {/* Sidebar */}
      <aside className="w-56 border-r border-black flex flex-col p-4">
        <h2 className="text-xl font-bold mb-8 tracking-tight">Bienvenido</h2>
        <p className="text-sm mb-8 tracking-tight break-words">
          {userEmail || "Cargando..."}
        </p>
        <nav className="flex flex-col gap-4">
          <button className="text-left font-semibold">Inicio</button>
          <button className="text-left">Ingenieros</button>
          <button className="text-left">Proyectos</button>
          <button className="text-left">Asignaciones</button>
          <button className="text-left">Reportes</button>
          <button className="text-left">Configuración</button>
        </nav>
      </aside>

      {/* Main workspace */}
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Panel de Ingenieros</h1>
          <div className="flex gap-4">
            <button className="bg-white text-black border border-black px-4 py-2 rounded hover:bg-black hover:text-white transition">
              Botón Auxiliar
            </button>
            <button
              className="bg-white text-black border border-black px-4 py-2 rounded hover:bg-black hover:text-white transition"
              onClick={() => router.push("/register")}
            >
              Registrar ingeniero
            </button>
            <button className="bg-white text-black border border-black px-4 py-2 rounded hover:bg-black hover:text-white transition">
              Asignar a proyecto
            </button>
          </div>
        </div>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar ingeniero..."
          className="border border-black rounded px-3 py-2 mb-6 w-full"
        />

        {/* Lista de ingenieros */}
        <ShowEngineers />
      </main>
    </div>
  );
}
