"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";
import { FaPlus } from "react-icons/fa";

export default function RegisterRate({ onSuccess }) {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [hourRate, setHourRate] = useState("");
  const [halfDayRate, setHalfDayRate] = useState("");
  const [fullDayRate, setFullDayRate] = useState("");
  const [extraHourRate, setExtraHourRate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("id, company_name");
    if (error) {
      toast.error("Error al cargar clientes");
    } else {
      setClients(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientId) {
      toast.error("Seleccione un cliente");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("client_rates").insert([
      {
        client_id: clientId,
        hourly_rate: parseFloat(hourRate) || 0,
        half_day_rate: parseFloat(halfDayRate) || 0,
        full_day_rate: parseFloat(fullDayRate) || 0,
        extra_hour_rate: parseFloat(extraHourRate) || 0,
        notes,
      },
    ]);

    if (error) {
      toast.error("Error al registrar tarifas");
    } else {
      toast.success("Tarifas registradas con éxito");
      onSuccess?.(); // Cierra el modal
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-md">
      <h2 className="text-lg font-bold text-blue-800 mb-4">
        Registrar tarifas por cliente
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cliente
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            required
          >
            <option value="">Seleccione un cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company_name}
              </option>
            ))}
          </select>
        </div>

        {/* Tarifas por modalidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tarifa por hora (USD)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={hourRate}
            onChange={(e) => setHourRate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Media jornada (USD)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={halfDayRate}
            onChange={(e) => setHalfDayRate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Jornada completa (USD)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={fullDayRate}
            onChange={(e) => setFullDayRate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hora extra (USD)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={extraHourRate}
            onChange={(e) => setExtraHourRate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            rows={2}
          />
        </div>

        {/* Botón de registrar */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold py-3 rounded-md shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          <FaPlus />
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
}
