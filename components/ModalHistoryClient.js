"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { FaMoneyBillWave } from "react-icons/fa";

export default function ModalHistoryClient({ client, onClose }) {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("id, payment_date, amount_usd, amount_mxn, conversion_rate")
        .eq("client_id", client.id)
        .order("payment_date", { ascending: false })
        .limit(10);

      if (error) console.error("Error al cargar historial", error);
      else setPayments(data || []);
    };

    if (client?.id) fetchPayments();
  }, [client]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold text-blue-800 mb-4">
          Historial de pagos: {client?.company_name}
        </h2>

        {payments.length === 0 ? (
          <p className="text-gray-600">No hay pagos registrados.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {payments.map((p) => (
              <li key={p.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Fecha:{" "}
                    <strong>
                      {new Date(p.payment_date).toLocaleDateString()}
                    </strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Monto: {p.amount_usd} USD
                    {p.amount_mxn && (
                      <>
                        {" "}
                        / {p.amount_mxn} MXN (TC: {p.conversion_rate})
                      </>
                    )}
                  </p>
                </div>
                <div className="text-blue-700 text-xl">
                  <FaMoneyBillWave />
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
