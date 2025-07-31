"use client";

import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import { FaPlus, FaCalculator } from "react-icons/fa";
import Modal from "@/components/Modal";
import ShowIncomes from "@/components/ShowIncomes";
import RegisterIncome from "@/components/RegisterIncome";
import ExchangeCalculator from "@/components/ExchangeCalculator";

export default function IncomesPage() {
  const { setHeader } = useHeader();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  useEffect(() => {
    setHeader({
      title: "Ingresos Registrados",
      subtitle: "Consulta y administra tus ingresos por actividad o cliente",
      actions: [
        {
          label: "Registrar Ingreso",
          icon: FaPlus,
          onClick: () => setShowRegisterModal(true),
        },
        {
          label: "Calculadora de Conversión",
          icon: FaCalculator,
          onClick: () => setShowCalculatorModal(true),
        },
      ],
    });
  }, [setHeader]);

  const handleSuccess = () => {
    setShowRegisterModal(false);
    setRefreshSignal((r) => r + 1);
  };

  return (
    <div className="flex flex-col h-full p-4 max-w-full overflow-hidden">
      <div className="w-full max-w-full overflow-x-auto">
        <ShowIncomes refreshSignal={refreshSignal} />
      </div>

      <Modal
        show={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      >
        <RegisterIncome onSuccess={handleSuccess} />
      </Modal>

      <Modal
        show={showCalculatorModal}
        onClose={() => setShowCalculatorModal(false)}
      >
        <ExchangeCalculator />
      </Modal>
    </div>
  );
}
