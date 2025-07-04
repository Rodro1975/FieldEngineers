"use client";

import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import ShowProjects from "@/components/ShowProjects"; // Componente para mostrar proyectos
import RegisterProject from "@/components/RegisterProjects"; // Componente para registrar proyecto
import Modal from "@/components/Modal";
import { FaPlus } from "react-icons/fa";

export default function ProjectsPage() {
  const { setHeader } = useHeader();
  const [showModal, setShowModal] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

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
    </div>
  );
}
