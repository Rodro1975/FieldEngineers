"use client";

import { useEffect, useState, useCallback } from "react";
import supabase from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function ShowCalendarEvents({ selectedDate, onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!selectedDate) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("calendar_events")
      .select("id, title, description")
      .eq("event_date", selectedDate.toISOString().split("T")[0]);

    if (error) {
      toast.error("Error al cargar eventos");
    } else {
      setEvents(data);
    }

    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-xl w-full">
      <h2 className="text-lg font-bold text-blue-800 mb-4">
        Eventos del día {selectedDate?.toLocaleDateString()}
      </h2>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">
          No hay eventos registrados para este día.
        </p>
      ) : (
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.id} className="border border-gray-300 p-3 rounded">
              <h3 className="font-semibold text-blue-700">{event.title}</h3>
              <p className="text-gray-600 text-sm">{event.description}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 text-right">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
