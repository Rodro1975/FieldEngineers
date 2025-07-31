"use client";

import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import supabase from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function RegisterPaymentsPage() {
  const { setHeader } = useHeader();
  const [clients, setClients] = useState([]);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (setHeader) {
      setHeader({
        title: "Registrar Pago General",
        subtitle: "Asignación de pagos a múltiples ingresos del cliente",
      });
    }
  }, [setHeader]);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, company_name");
      if (error) toast.error("Error al cargar clientes");
      else setClients(data || []);
    };
    fetchClients();
  }, []);

  const toggleAccordion = (clientId) => {
    setExpandedClientId(expandedClientId === clientId ? null : clientId);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Selecciona un cliente para registrar un pago
      </h2>
      <div className="bg-white shadow rounded-xl divide-y divide-gray-200">
        {clients.map((client) => (
          <div key={client.id}>
            <button
              onClick={() => toggleAccordion(client.id)}
              className="w-full flex justify-between items-center p-4 hover:bg-blue-50 text-left"
            >
              <span className="text-gray-800 font-medium">
                {client.company_name}
              </span>
              {expandedClientId === client.id ? (
                <FaChevronUp className="text-blue-600" />
              ) : (
                <FaChevronDown className="text-gray-400" />
              )}
            </button>
            {expandedClientId === client.id && (
              <div className="p-4 border-t bg-blue-50">
                <p className="text-sm text-gray-600 mb-3">ID: {client.id}</p>
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/billings/payments/register/${client.id}`
                    )
                  }
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  Continuar con este cliente
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
