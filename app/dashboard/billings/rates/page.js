"use client";

import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import { FaPlus } from "react-icons/fa";
import Modal from "@/components/Modal";
import ShowRates from "@/components/ShowRates";
import RegisterRate from "@/components/RegisterRate";

export default function RatesPage() {
  const { setHeader } = useHeader();
  const [showModal, setShowModal] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  useEffect(() => {
    setHeader({
      title: "Tarifas por Cliente",
      subtitle: "Consulta y gestiona las tarifas acordadas con tus clientes",
      actions: [
        {
          label: "Registrar Tarifa",
          icon: FaPlus,
          onClick: () => setShowModal(true),
        },
      ],
    });
  }, [setHeader]);

  const handleSuccess = () => {
    setShowModal(false);
    setRefreshSignal((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full p-4 max-w-full overflow-hidden">
      <div className="w-full max-w-full overflow-x-auto">
        <ShowRates refreshSignal={refreshSignal} />
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <RegisterRate onSuccess={handleSuccess} />
      </Modal>
    </div>
  );
}
