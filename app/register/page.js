"use client";

import { useRouter } from "next/navigation";
import RegisterEngineer from "@/components/RegisterEngineer ";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex bg-white text-black">
      {/* Sidebar opcional: puedes importar tu Sidebar aquí si quieres */}
      <main className="flex-1 p-10">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 text-sm text-blue-600 hover:underline"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold mb-4">Registrar Ingeniero</h1>
          <RegisterEngineer onSuccess={() => router.push("/dashboard")} />
        </div>
      </main>
    </div>
  );
}
