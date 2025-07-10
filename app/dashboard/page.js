// app/dashboard/page.js
"use client";

import { useEffect } from "react";
import { useHeader } from "@/context/HeaderContext";
import Image from "next/image";

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
    <div className="flex flex-col items-center justify-center p-4 bg-gray-50">
      <Image
        src="/LogoYellow.png"
        alt="Logotipo"
        width={400}
        height={400}
        className="relative w-full h-auto object-center"
      />
    </div>
  );
}
