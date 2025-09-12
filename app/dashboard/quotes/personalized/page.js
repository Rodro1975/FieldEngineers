"use client";

import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import { FaEye } from "react-icons/fa";
import PersonalizedQuote from "@/components/PersonalizedQuote";

export default function PersonalizedDocPage() {
  const { setHeader } = useHeader();
  const [previewCb, setPreviewCb] = useState(null); // { handlePreview }

  useEffect(() => {
    setHeader({
      title: "Documento personalizado",
      subtitle: "Membrete, asunto y texto libre para propuestas y cartas.",
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
      <PersonalizedQuote onReady={setPreviewCb} />
    </div>
  );
}
