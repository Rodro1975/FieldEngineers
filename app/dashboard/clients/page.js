"use client";

import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import Modal from "@/components/Modal";
import { FaPlus } from "react-icons/fa";
import ShowClients from "@/components/ShowClients";
import RegisterClients from "@/components/RegisterClients";

export default function ClientsPage() {
  const { setHeader } = useHeader();
  const [showModal, setShowModal] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  useEffect(() => {
    setHeader({
      title: "Gestión de Clientes",
      subtitle: "Administra la creación de clientes",
      actions: [
        {
          label: "Registrar Cliente",
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
        <ShowClients refreshSignal={refreshSignal} />
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <RegisterClients onSuccess={handleSuccess} />
      </Modal>
    </div>
  );
}
