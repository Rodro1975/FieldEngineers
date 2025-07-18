"use client";

import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import Modal from "@/components/Modal";
import { FaPlus } from "react-icons/fa";
import ShowBillings from "@/components/ShowBillings";

export default function BillingsPage() {
  const { setHeader } = useHeader();
  const [showModal, setShowModal] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  useEffect(() => {
    setHeader({
      title: "Contabilidad",
      subtitle: "Consulta y administra tus ingresos, egresos y facturación",
      actions: [
        {
          label: "Nuevo Registro",
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
        <ShowBillings refreshSignal={refreshSignal} />
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <div className="p-4">
          <p>
            Aquí irá el formulario para registrar facturas, ingresos, egresos,
            etc.
          </p>
        </div>
      </Modal>
    </div>
  );
}
