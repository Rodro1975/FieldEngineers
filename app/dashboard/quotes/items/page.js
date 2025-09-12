"use client";

import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import { FaEye } from "react-icons/fa";
import QuoteGenerator from "@/components/QuoteGenerator";

export default function QuotesByItemsPage() {
  const { setHeader } = useHeader();
  const [previewCb, setPreviewCb] = useState(null); // { handlePreview }

  useEffect(() => {
    setHeader({
      title: "Cotización por ítems",
      subtitle: "Arma tu propuesta con conceptos, totales y condiciones.",
      actions: previewCb?.handlePreview
        ? [
            {
              label: "Vista previa",
              icon: FaEye,
              onClick: previewCb.handlePreview,
            },
          ]
        : [],
    });
  }, [setHeader, previewCb]);

  return (
    <div className="p-4">
      <QuoteGenerator onReady={setPreviewCb} />
    </div>
  );
}
