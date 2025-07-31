"use client";

import { useState } from "react";
import supabase from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function EditIncomes({ income, onClose, onUpdated }) {
  const [hours, setHours] = useState(income.hours_worked);
  const [rate, setRate] = useState(income.rate_applied);
  const [total, setTotal] = useState(income.total_usd);
  const [notes, setNotes] = useState(income.notes || "");
  const [serviceDate, setServiceDate] = useState(
    income.service_date ? income.service_date.split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const override = rate !== income.rate_applied || total !== income.total_usd;

    const { error } = await supabase
      .from("incomes")
      .update({
        hours_worked: hours,
        rate_applied: rate,
        total_usd: total,
        notes,
        service_date: serviceDate || null,
        override_tarifa: override,
      })
      .eq("id", income.id);

    setSaving(false);

    if (error) {
      toast.error("Error al actualizar ingreso");
    } else {
      toast.success("Ingreso actualizado correctamente");
      onUpdated();
      onClose();
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Editar Ingreso</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">
            Fecha de ejecución del servicio
          </label>
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Horas trabajadas
          </label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full p-2 border rounded"
            min={0}
            step={0.1}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Tarifa aplicada (USD)
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full p-2 border rounded"
            min={0}
            step={0.01}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Total (USD)</label>
          <input
            type="number"
            value={total}
            onChange={(e) => setTotal(Number(e.target.value))}
            className="w-full p-2 border rounded"
            min={0}
            step={0.01}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border rounded"
          />
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
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
