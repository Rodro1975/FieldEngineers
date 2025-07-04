// app/dashboard/page.js
"use client";

import { useEffect } from "react";
import { useHeader } from "@/context/HeaderContext";

export default function DashboardHome() {
  const { setHeader } = useHeader();

  useEffect(() => {
    setHeader({
      title: "Bienvenido a tu espacio de trabajo",
      subtitle: "Selecciona una opción en la barra lateral.",
      actions: [],
    });
  }, [setHeader]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Bienvenido al Panel</h1>
      <p className="text-gray-700">
        Selecciona una opción en la barra lateral.
      </p>
    </>
  );
}
