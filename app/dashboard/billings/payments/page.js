"use client";

import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import supabase from "@/lib/supabaseClient";
import ModalHistoryClient from "@/components/ModalHistoryClient";
import { FaUser } from "react-icons/fa";

export default function PaymentsPage() {
  const { setHeader } = useHeader();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setHeader({
      title: "Historial de Pagos",
      subtitle: "Consulta los últimos pagos realizados por cliente",
      actions: [
        {
          label: "Registrar nuevo pago",
          onClick: () =>
            window.location.assign("/dashboard/billings/payments/register"),
        },
      ],
    });
  }, [setHeader]);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, company_name");
      if (error) console.error("Error al cargar clientes", error);
      else setClients(data);
    };
    fetchClients();
  }, []);

  const openModal = (client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedClient(null);
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full p-4 max-w-full overflow-hidden">
      <div className="w-full max-w-full overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Selecciona un cliente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              onClick={() => openModal(client)}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition cursor-pointer flex items-center gap-4"
            >
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full text-xl">
                <FaUser />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {client.company_name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && selectedClient && (
        <ModalHistoryClient client={selectedClient} onClose={closeModal} />
      )}
    </div>
  );
}
