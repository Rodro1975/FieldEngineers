"use client";

import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaPlus } from "react-icons/fa";
import Modal from "@/components/Modal";
import RegisterCalendarEvent from "@/components/RegisterCalendarEvent";
import ShowCalendarEvents from "@/components/ShowCalendarEvents";
import supabase from "@/lib/supabaseClient";

export default function CalendarPage() {
  const { setHeader } = useHeader();
  const [value, setValue] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [eventDates, setEventDates] = useState([]);

  useEffect(() => {
    setHeader({
      title: "Agenda",
      subtitle: "Visualiza tus eventos, cobros y pagos",
      actions: [
        {
          label: "Agregar Evento",
          onClick: () => {
            setSelectedDate(new Date());
            setShowAddModal(true);
          },
          icon: FaPlus,
        },
      ],
    });
  }, [setHeader]);

  // Cargar fechas de eventos
  useEffect(() => {
    async function fetchEventDates() {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("event_date");

      if (!error && data) {
        const fechas = data.map((d) => d.event_date);
        setEventDates(fechas);
      }
    }

    fetchEventDates();
  }, [refreshSignal]);

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setShowViewModal(true);
  };

  const handleSuccess = () => {
    setShowAddModal(false);
    setRefreshSignal((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full p-4 max-w-full overflow-hidden">
      <div className="flex justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <Calendar
            onChange={setValue}
            value={value}
            onClickDay={handleDayClick}
            tileClassName={({ date, view }) => {
              if (view === "month") {
                const fecha = date.toISOString().split("T")[0];
                if (eventDates.includes(fecha)) {
                  return "custom-event-day";
                }
              }
              return "";
            }}
          />
        </div>
      </div>

      <Modal show={showAddModal} onClose={() => setShowAddModal(false)}>
        <RegisterCalendarEvent
          selectedDate={selectedDate}
          onSuccess={handleSuccess}
          onClose={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal show={showViewModal} onClose={() => setShowViewModal(false)}>
        <ShowCalendarEvents
          selectedDate={selectedDate}
          onClose={() => setShowViewModal(false)}
          refreshSignal={refreshSignal}
        />
      </Modal>
    </div>
  );
}
