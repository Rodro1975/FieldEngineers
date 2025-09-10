"use client";

import { useState } from "react";
import {
  FaFileAlt,
  FaTools,
  FaClipboardCheck,
  FaFileSignature,
  FaFolderOpen,
} from "react-icons/fa";
import Modal from "@/components/Modal";
import DocTechnical from "@/components/DocTechnical";

function DocCard({ title, description, icon, onClick }) {
  return (
    <button
      className="text-left flex flex-col gap-2 bg-white p-4 rounded-lg shadow hover:shadow-md transition"
      onClick={onClick}
    >
      <div className="text-2xl">{icon}</div>
      <div className="font-bold">{title}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </button>
  );
}

export default function ShowDocs() {
  const [showTechModal, setShowTechModal] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DocCard
          title="Documento Técnico"
          description="Genera documentos técnicos en hoja membretada."
          icon={<FaFileAlt />}
          onClick={() => setShowTechModal(true)}
        />

        <DocCard
          title="Carta de Servicios"
          description="Crea una carta formal con los servicios ofrecidos."
          icon={<FaClipboardCheck />}
          onClick={() => alert("En construcción")}
        />

        <DocCard
          title="Constancia de Servicio"
          description="Entrega constancias de atención o ejecución de trabajos."
          icon={<FaFileSignature />}
          onClick={() => alert("En construcción")}
        />

        <DocCard
          title="Ficha Técnica"
          description="Presenta fichas técnicas de equipos o sistemas."
          icon={<FaTools />}
          onClick={() => alert("En construcción")}
        />

        <DocCard
          title="Otros Documentos"
          description="Genera otros formatos o archivos institucionales."
          icon={<FaFolderOpen />}
          onClick={() => alert("En construcción")}
        />
      </div>

      <Modal show={showTechModal} onClose={() => setShowTechModal(false)}>
        <DocTechnical onClose={() => setShowTechModal(false)} />
      </Modal>
    </>
  );
}
