"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { FaPlus } from "react-icons/fa";

export default function RegisterCalendarEvent({
  selectedDate,
  onSuccess,
  onClose,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const iso = selectedDate.toISOString().split("T")[0];
      setEventDate(iso);
    }
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return toast.error("El título es obligatorio");
    if (!eventDate) return toast.error("Selecciona una fecha");
    if (!userId) return toast.error("No se pudo identificar al usuario");

    setLoading(true);
    const { error } = await supabase.from("calendar_events").insert([
      {
        user_id: userId,
        title,
        description,
        event_date: eventDate,
      },
    ]);

    if (error) {
      toast.error("Error al registrar evento");
    } else {
      toast.success("Evento registrado con éxito");
      setTimeout(() => {
        onSuccess?.();
      }, 300);
    }

    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-md w-full">
      <Toaster position="top-center" />

      <h2 className="text-lg font-bold text-blue-800 mb-4">Registrar evento</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fecha editable */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha del evento
          </label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            required
          />
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Título del evento
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            rows={3}
          />
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold py-3 rounded-md shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          <FaPlus />
          {loading ? "Registrando..." : "Registrar Evento"}
        </button>
      </form>
    </div>
  );
}
