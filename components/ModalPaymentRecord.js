"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";
import { FaMoneyCheckAlt } from "react-icons/fa";

export default function ModalPaymentRecord({ income, onClose, onUpdated }) {
  const [paymentDate, setPaymentDate] = useState("");
  const [amount, setAmount] = useState("");
  const [conversionRate, setConversionRate] = useState(null);
  const [convertedUSD, setConvertedUSD] = useState(0);
  const [saving, setSaving] = useState(false);
  const [forceFullPayment, setForceFullPayment] = useState(false);
  const [currency, setCurrency] = useState("MXN");

  useEffect(() => {
    const fetchRate = async () => {
      if (currency === "MXN") {
        try {
          const res = await fetch(
            "https://v6.exchangerate-api.com/v6/0027ceb4cac5d268401c7232/latest/MXN"
          );
          const data = await res.json();
          if (!data.conversion_rates?.USD) throw new Error("Formato inválido");
          setConversionRate(data.conversion_rates.USD);
        } catch (error) {
          toast.error("Error al obtener tipo de cambio: " + error.message);
        }
      } else {
        setConversionRate(1);
      }
    };
    fetchRate();
  }, [currency]);

  useEffect(() => {
    if (amount && conversionRate) {
      const usd =
        currency === "MXN"
          ? (parseFloat(amount) * conversionRate).toFixed(2)
          : parseFloat(amount).toFixed(2);
      setConvertedUSD(usd);
    } else {
      setConvertedUSD(0);
    }
  }, [amount, conversionRate, currency]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          client_id: income.client_id_payer,
          amount_mxn: currency === "MXN" ? parseFloat(amount) : null,
          amount_usd: parseFloat(convertedUSD),
          conversion_rate: conversionRate,
          payment_date: paymentDate,
          profile_id: income.profile_id,
        })
        .select()
        .single();

      if (paymentError || !payment?.id) {
        throw new Error(
          paymentError?.message || "No se generó el pago correctamente"
        );
      }

      const { error: linkError } = await supabase.from("payment_links").insert({
        payment_id: payment.id,
        income_id: income.id,
        amount_applied_usd: parseFloat(convertedUSD),
      });

      if (linkError) {
        throw new Error("Error al vincular ingreso: " + linkError.message);
      }

      if (forceFullPayment) {
        const { error: updateError } = await supabase
          .from("incomes")
          .update({
            paid_date: paymentDate,
            payment_status: "pagado",
          })
          .eq("id", income.id);

        if (updateError) {
          throw new Error(
            "Error al actualizar ingreso: " + updateError.message
          );
        }
      }

      toast.success("Pago registrado correctamente");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full relative">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-700">
          <FaMoneyCheckAlt /> Registrar Pago
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha de pago
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Moneda del pago
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
            >
              <option value="MXN">Pesos Mexicanos (MXN)</option>
              <option value="USD">Dólares Americanos (USD)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Monto en{" "}
              {currency === "MXN" ? "pesos mexicanos (MXN)" : "dólares (USD)"}
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

          {conversionRate && currency === "MXN" && (
            <div className="text-sm text-gray-600">
              Tipo de cambio actual:{" "}
              <strong>1 MXN = {conversionRate} USD</strong>
              <br />
              Valor convertido: <strong>${convertedUSD} USD</strong>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="force-full"
              checked={forceFullPayment}
              onChange={() => setForceFullPayment(!forceFullPayment)}
            />
            <label htmlFor="force-full" className="text-sm text-gray-800">
              Este pago cubre el ingreso completo
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !convertedUSD}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
