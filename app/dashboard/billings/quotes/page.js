"use client";

import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import { FaEye } from "react-icons/fa";
import QuoteGenerator from "@/components/QuoteGenerator";

export default function QuotesPage() {
  const { setHeader } = useHeader();
  const [previewCallback, setPreviewCallback] = useState(null);

  useEffect(() => {
    setHeader({
      title: "Cotizaciones",
      subtitle: "Genera documentos profesionales para tus clientes.",
      actions: previewCallback
        ? [
            {
              label: "Vista previa",
              icon: FaEye,
              onClick: previewCallback.handlePreview,
            },
          ]
        : [],
    });
  }, [setHeader, previewCallback]);

  return (
    <div className="p-4">
      <QuoteGenerator onReady={setPreviewCallback} />
    </div>
  );
}
