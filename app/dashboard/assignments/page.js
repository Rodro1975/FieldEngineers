"use client";

import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import ShowAssignments from "@/components/ShowAssignments"; // Componente para mostrar asignaciones
import Modal from "@/components/Modal";
import { FaPlus } from "react-icons/fa";
import RegisterAssignment from "@/components/RegisterAssignment";

export default function AssignmentsPage() {
  const { setHeader } = useHeader();
  const [showModal, setShowModal] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  useEffect(() => {
    setHeader({
      title: "Gestión de Asignaciones",
      subtitle: "Administra las asignaciones de proyectos a ingenieros",
      actions: [
        {
          label: "Nueva Asignación",
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
        <ShowAssignments refreshSignal={refreshSignal} />
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <RegisterAssignment onSuccess={handleSuccess} />
      </Modal>
    </div>
  );
}
