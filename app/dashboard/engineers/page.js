"use client";

import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import ShowEngineers from "@/components/ShowEngineers";
import RegisterEngineer from "@/components/RegisterEngineer";
import Modal from "@/components/Modal";
import { FaUserPlus } from "react-icons/fa";

export default function EngineersPage() {
  const { setHeader } = useHeader();
  const [showModal, setShowModal] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  useEffect(() => {
    setHeader({
      title: "Gestión de Ingenieros",
      subtitle: "Administra los ingenieros de tu equipo",
      actions: [
        {
          label: "Registrar Ingeniero",
          onClick: () => setShowModal(true),
          icon: FaUserPlus,
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
        <ShowEngineers refreshSignal={refreshSignal} />
      </div>
      {/* Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <RegisterEngineer onSuccess={handleSuccess} />
      </Modal>
    </div>
  );
}
