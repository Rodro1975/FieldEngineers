"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import supabase from "@/lib/supabaseClient";
import { useHeader } from "@/context/HeaderContext";
import { FaRegCalendarAlt } from "react-icons/fa";
import RecentPayments from "@/components/RecentPayments";

export default function RegisterClientPaymentPage() {
  const { client_id } = useParams();
  const [client, setClient] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [selectedIncomes, setSelectedIncomes] = useState([]);
  const [paymentDate, setPaymentDate] = useState("");
  const [currency, setCurrency] = useState("MXN");
  const [conversionRate, setConversionRate] = useState(null);
  const [amountReceived, setAmountReceived] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setHeader } = useHeader();

  useEffect(() => {
    if (setHeader) {
      setHeader({
        title: client?.company_name
          ? `Registrar pago para ${client.company_name}`
          : "Registrar pago",
        actions: [
          {
            label: "Volver a clientes",
            onClick: () => router.push("/dashboard/billings/payments/register"),
          },
        ],
      });
    }
  }, [setHeader, client, router]);

  useEffect(() => {
    const fetchClient = async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, company_name")
        .eq("id", client_id)
        .single();

      if (error || !data) {
        toast.error("Cliente no encontrado");
        return;
      }
      setClient(data);
    };

    const fetchIncomes = async () => {
      const { data, error } = await supabase
        .from("incomes")
        .select(
          "id, total_usd, remaining_usd, activity, service_date, project_id, profile_id"
        )
        .eq("client_id_payer", client_id)
        .in("payment_status", ["pendiente", "parcial"]);

      if (error) toast.error("Error al cargar ingresos");
      else setIncomes(data || []);
    };

    fetchClient();
    fetchIncomes();
  }, [client_id]);

  useEffect(() => {
    const fetchRate = async () => {
      if (currency === "MXN") {
        try {
          const res = await fetch(
            "https://v6.exchangerate-api.com/v6/0027ceb4cac5d268401c7232/latest/MXN"
          );
          const data = await res.json();
          if (!data.conversion_rates?.USD)
            throw new Error("Tipo de cambio no válido");
          setConversionRate(data.conversion_rates.USD);
        } catch (err) {
          toast.error("Error con el tipo de cambio: " + err.message);
        }
      } else {
        setConversionRate(1);
      }
    };
    fetchRate();
  }, [currency]);

  const handleSubmit = async () => {
    if (!paymentDate || !amountReceived || selectedIncomes.length === 0) {
      toast.error("Completa todos los campos");
      return;
    }

    const receivedUSD =
      currency === "MXN"
        ? parseFloat(amountReceived) * conversionRate
        : parseFloat(amountReceived);

    if (isNaN(receivedUSD) || receivedUSD < 0.01) {
      toast.error("Monto inválido");
      return;
    }

    // ✅ Obtener el usuario autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      toast.error("No se pudo obtener el usuario autenticado");
      return;
    }

    const firstProfileId = user.id;
    console.log("✅ profile_id asignado:", firstProfileId);
    console.log("1️⃣ Recibido USD:", receivedUSD);
    console.log("2️⃣ Ingresos seleccionados:", selectedIncomes);

    setLoading(true);

    // ... (continúa la lógica del try { await supabase.from("payments").insert(... etc)

    try {
      const { data: payment, error: payError } = await supabase
        .from("payments")
        .insert({
          client_id,
          payment_date: paymentDate,
          amount_usd: receivedUSD,
          amount_mxn: currency === "MXN" ? parseFloat(amountReceived) : null,
          conversion_rate: conversionRate,
          remaining_usd: receivedUSD,
          profile_id: firstProfileId,
        })
        .select()
        .single();

      if (payError || !payment) {
        console.error("❌ Error al insertar pago:", payError);
        throw payError;
      }

      console.log("3️⃣ Pago insertado:", payment);

      let remaining = receivedUSD;
      for (const income of selectedIncomes) {
        const available = income.remaining_usd ?? income.total_usd;
        const applied = Math.min(remaining, available);
        remaining -= applied;

        console.log("4️⃣ Aplicando a income:", income.id, "Aplicado:", applied);

        const { error: linkError } = await supabase
          .from("payment_links")
          .insert({
            payment_id: payment.id,
            income_id: income.id,
            amount_applied_usd: applied,
          });
        if (linkError) {
          console.error("❌ Error al insertar payment_link:", linkError);
          throw linkError;
        }

        const newRemaining = available - applied;
        const status = newRemaining <= 0 ? "pagado" : "parcial";

        const { error: updateError } = await supabase
          .from("incomes")
          .update({
            remaining_usd: newRemaining,
            payment_status: status,
            paid_date: status === "pagado" ? paymentDate : null,
          })
          .eq("id", income.id);

        if (updateError) {
          console.error("❌ Error al actualizar income:", updateError);
          throw updateError;
        }

        if (remaining <= 0) break;
      }

      const finalRemaining = Math.max(remaining, 0); // nunca menor a cero

      const { error: updatePaymentError } = await supabase
        .from("payments")
        .update({ remaining_usd: finalRemaining })
        .eq("id", payment.id);

      if (updatePaymentError) {
        console.error(
          "❌ Error al actualizar payment restante:",
          updatePaymentError
        );
        throw updatePaymentError;
      }

      toast.success("Pago registrado con éxito");

      const { data: updatedIncomes } = await supabase
        .from("incomes")
        .select(
          "id, total_usd, remaining_usd, activity, service_date, project_id, profile_id"
        )
        .eq("client_id_payer", client_id)
        .in("payment_status", ["pendiente", "parcial"]);

      setIncomes(updatedIncomes || []);
      setSelectedIncomes([]);
      setAmountReceived("");
      setPaymentDate("");
    } catch (err) {
      toast.error("Error al registrar el pago: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const receivedUSD =
    currency === "MXN"
      ? parseFloat(amountReceived || 0) * (conversionRate || 1)
      : parseFloat(amountReceived || 0);

  const selectedTotal = selectedIncomes.reduce(
    (sum, inc) => sum + (inc.remaining_usd ?? inc.total_usd ?? 0),
    0
  );

  const difference = receivedUSD - selectedTotal;

  return (
    <div className="flex flex-col h-full p-4 max-w-full overflow-hidden">
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm font-semibold">Fecha de pago</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Moneda</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="MXN">Pesos MXN</option>
            <option value="USD">Dólares USD</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">
            Monto recibido ({currency})
          </label>
          <input
            type="number"
            value={amountReceived}
            onChange={(e) => setAmountReceived(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-700 mb-2">
          Selecciona ingresos:
        </h3>
        <div className="border rounded p-3 max-h-60 overflow-y-auto space-y-2">
          {incomes.map((inc) => (
            <label
              key={inc.id}
              className="flex items-start gap-2 text-sm text-gray-800"
            >
              <input
                type="checkbox"
                checked={selectedIncomes.some((i) => i.id === inc.id)}
                onChange={(e) => {
                  if (e.target.checked)
                    setSelectedIncomes((prev) => [...prev, inc]);
                  else
                    setSelectedIncomes((prev) =>
                      prev.filter((i) => i.id !== inc.id)
                    );
                }}
              />
              <span>
                <strong>{inc.activity || "Sin actividad"}</strong>
                <br />
                {inc.service_date ? (
                  <>
                    <FaRegCalendarAlt className="inline mr-1 text-gray-500" />
                    {inc.service_date}
                  </>
                ) : (
                  "Sin fecha"
                )}{" "}
                – ${inc.total_usd.toFixed(2)} USD
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="border rounded bg-gray-50 p-3 mb-4 text-sm text-gray-700">
        <p>
          <strong>Total seleccionado:</strong> ${selectedTotal.toFixed(2)} USD
        </p>
        <p>
          <strong>Diferencia contra monto recibido:</strong>{" "}
          <span
            className={
              difference > 0
                ? "text-green-700"
                : difference < 0
                ? "text-red-700"
                : "text-gray-700"
            }
          >
            {difference >= 0 ? "+" : "-"}${Math.abs(difference).toFixed(2)} USD
          </span>
        </p>
      </div>

      <div className="flex justify-end">
        <button
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
          disabled={loading}
        >
          Guardar pago
        </button>
      </div>
      {client && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">
            Pagos recientes del cliente:
          </h3>
          <RecentPayments clientId={client_id} />
        </div>
      )}
    </div>
  );
}
