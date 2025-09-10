"use client";

import { useEffect, useState, useMemo } from "react";
import { useHeader } from "@/context/HeaderContext";
import Modal from "@/components/Modal";
import ShowDocs from "@/components/ShowDocs";
import DocTechnical from "@/components/DocTechnical";
import { FaEye } from "react-icons/fa";

export default function DocumentationPage() {
  const { setHeader } = useHeader();
  const [showModal, setShowModal] = useState(false);
  const [selectedDocComponent, setSelectedDocComponent] = useState(null);
  const [refreshSignal, setRefreshSignal] = useState(0);

  const handlePreview = (component) => {
    setSelectedDocComponent(component);
    setShowModal(true);
  };

  // Memo para evitar warning de dependencia en useEffect
  const previewCallback = useMemo(
    () => ({
      handlePreview: () =>
        handlePreview(<DocTechnical onClose={() => setShowModal(false)} />),
    }),
    []
  );

  useEffect(() => {
    setHeader({
      title: "Gestión de Documentación",
      subtitle: "Crea y administra documentos técnicos membretados",
      actions: [
        {
          label: "Vista previa",
          onClick: previewCallback.handlePreview,
          icon: FaEye,
        },
      ],
    });
  }, [setHeader, previewCallback]);

  return (
    <div className="flex flex-col h-full p-4 max-w-full overflow-hidden">
      <div className="w-full max-w-full overflow-x-auto">
        <ShowDocs refreshSignal={refreshSignal} />
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        {selectedDocComponent}
      </Modal>
    </div>
  );
}
