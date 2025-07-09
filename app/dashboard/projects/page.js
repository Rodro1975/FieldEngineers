"use client";

import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import ShowProjects from "@/components/ShowProjects"; // Componente para mostrar proyectos
import RegisterProject from "@/components/RegisterProjects"; // Componente para registrar proyecto
import Modal from "@/components/Modal";
import { FaPlus, FaClipboardList } from "react-icons/fa";
import TrackProject from "@/components/TrackProject";

export default function ProjectsPage() {
  const { setHeader } = useHeader();
  const [showModal, setShowModal] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  useEffect(() => {
    setHeader({
      title: "Gestión de Proyectos",
      subtitle: "Administra los proyectos activos y finalizados",
      actions: [
        {
          label: "Registrar Proyecto",
          onClick: () => setShowModal(true),
          icon: FaPlus,
        },
        {
          label: "Seguimiento de Proyecto",
          onClick: () => setShowTrackingModal(true), // Nuevo modal
          icon: FaClipboardList, // Puedes importar este ícono de react-icons/fa
        },
      ],
    });
  }, [setHeader]);

  const handleSuccess = () => {
    setShowModal(false);
    setRefreshSignal((r) => r + 1);
  };

  return (
    <div className="flex flex-col h-full p-4 max-w-full overflow-hidden">
      <div className="w-full max-w-full overflow-x-auto">
        <ShowProjects refreshSignal={refreshSignal} />
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <RegisterProject onSuccess={handleSuccess} />
      </Modal>
      <Modal
        show={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
      >
        <TrackProject
          onSuccess={handleSuccess}
          onClose={() => setShowTrackingModal(false)} // ← este es el que faltaba
        />
      </Modal>
    </div>
  );
}
