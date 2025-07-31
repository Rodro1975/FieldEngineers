"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { FaDollarSign, FaClock, FaBalanceScale } from "react-icons/fa";

export default function RecentPayments({ clientId }) {
  const [payments, setPayments] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clientId) return;

    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // 1. Obtener últimos 5 pagos
        const { data: paymentData, error: paymentError } = await supabase
          .from("payments")
          .select("id, payment_date, amount_usd, remaining_usd")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (paymentError) throw paymentError;

        // 2. Sumar total pagado
        const { data: allPayments, error: allPaymentsError } = await supabase
          .from("payments")
          .select("amount_usd")
          .eq("client_id", clientId);

        if (allPaymentsError) throw allPaymentsError;

        const sumPaid = allPayments.reduce(
          (acc, cur) => acc + parseFloat(cur.amount_usd ?? 0),
          0
        );

        // 3. Sumar total pendiente de ingresos con estados pendientes/parciales

        const { data: incomesData, error: incomesError } = await supabase
          .from("incomes")
          .select("remaining_usd")
          .eq("client_id_payer", clientId)
          .in("payment_status", ["pendiente", "parcial"]);

        if (incomesError) throw incomesError;

        const sumPending = incomesData.reduce(
          (acc, cur) => acc + parseFloat(cur.remaining_usd ?? 0),
          0
        );

        setPayments(paymentData || []);
        setTotalPaid(sumPaid);
        setTotalPending(sumPending);
      } catch (err) {
        setError(err.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  if (loading)
    return <p className="text-gray-500 text-sm">Cargando pagos...</p>;

  if (error)
    return <p className="text-red-600 text-sm font-semibold">Error: {error}</p>;

  return (
    <div className="p-4 bg-white rounded-md shadow-md max-w-md">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FaDollarSign /> Pagos recientes del cliente
      </h2>

      <div className="mb-4 flex justify-between bg-gray-100 p-3 rounded">
        <div className="flex items-center gap-2">
          <FaBalanceScale className="text-green-600" />
          <span>
            <strong>Total pagado:</strong> ${totalPaid.toFixed(2)} USD
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FaClock className="text-yellow-600" />
          <span>
            <strong>Saldo pendiente:</strong> ${totalPending.toFixed(2)} USD
          </span>
        </div>
      </div>

      {payments.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No se han registrado pagos para este cliente.
        </p>
      ) : (
        <ul className="space-y-3 max-h-60 overflow-y-auto">
          {payments.map((p) => (
            <li
              key={p.id}
              className="border-b pb-1 text-gray-700 flex justify-between items-center"
              aria-label={`Pago del día ${
                p.payment_date
              } por ${p.amount_usd.toFixed(2)} USD`}
            >
              <span>
                <strong>{p.payment_date}</strong> - ${p.amount_usd.toFixed(2)}{" "}
                USD
              </span>
              {p.remaining_usd > 0 && (
                <span className="text-yellow-700 text-sm">
                  (+${p.remaining_usd.toFixed(2)} sin aplicar)
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
