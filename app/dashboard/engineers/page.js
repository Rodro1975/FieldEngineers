"use client";

import { useState } from "react";
import ShowEngineers from "@/components/ShowEngineers";
import RegisterEngineer from "@/components/RegisterEngineer";
import Modal from "@/components/Modal";

export default function EngineersPage() {
  const [showModal, setShowModal] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0); // <--- NUEVO

  const handleSuccess = () => {
    setShowModal(false);
    setRefreshSignal((r) => r + 1); // <--- ACTUALIZA LA SEÑAL
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Ingenieros</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-4 py-2 rounded hover:bg-white hover:text-black border border-black transition"
        >
          Registrar ingeniero
        </button>
      </div>

      {/* Pasa refreshSignal como prop */}
      <ShowEngineers refreshSignal={refreshSignal} />

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <RegisterEngineer onSuccess={handleSuccess} />
      </Modal>
    </div>
  );
}
