"use client";

import { useEffect } from "react";
import { useHeader } from "@/context/HeaderContext";
import ShowQuotes from "@/components/ShowQuotes";

export default function SentQuotesPage() {
  const { setHeader } = useHeader();

  useEffect(() => {
    setHeader({
      title: "Cotizaciones enviadas",
      subtitle: "Historial, búsqueda y acceso a PDF de cotizaciones",
      actions: [], // sin botón extra aquí
    });
  }, [setHeader]);

  return (
    <div className="p-4">
      <ShowQuotes />
    </div>
  );
}
