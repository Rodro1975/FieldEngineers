"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import supabase from "@/lib/supabaseClient";
import { FaPlus } from "react-icons/fa";

const WEEKDAYS = [
  { code: "MO", label: "Lun" },
  { code: "TU", label: "Mar" },
  { code: "WE", label: "Mié" },
  { code: "TH", label: "Jue" },
  { code: "FR", label: "Vie" },
  { code: "SA", label: "Sáb" },
  { code: "SU", label: "Dom" },
];

export default function RegisterProject({ onSuccess }) {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    client_id: "",
    name: "",
    description: "",
    start_date: "",
    end_date: "",

    // NUEVOS CAMPOS
    is_recurring: false,
    recurrence_frequency: "", // 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
    recurrence_interval: 1, // útil para semanal/quincenal
    recurrence_byweekday: [], // array de 'MO','TU',...
    recurrence_bymonthday: "", // número 1-31
    recurrence_summary: "", // texto humano
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchClients() {
      const { data, error } = await supabase
        .from("clients")
        .select("id, company_name")
        .order("company_name", { ascending: true });
      if (error) {
        toast.error("Error al cargar clientes: " + error.message);
      } else {
        setClients(data || []);
      }
    }
    fetchClients();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleWeekdayToggle = (code) => {
    setForm((prev) => {
      const exists = prev.recurrence_byweekday.includes(code);
      const next = exists
        ? prev.recurrence_byweekday.filter((d) => d !== code)
        : [...prev.recurrence_byweekday, code];
      return { ...prev, recurrence_byweekday: next };
    });
  };

  // Actualiza intervalo automáticamente si eligen "Quincenal"
  useEffect(() => {
    const desired =
      form.recurrence_frequency === "BIWEEKLY"
        ? 2
        : form.recurrence_frequency === "WEEKLY"
        ? Math.max(1, Number(form.recurrence_interval || 1))
        : form.recurrence_interval;

    if (desired !== form.recurrence_interval) {
      setForm((prev) => ({ ...prev, recurrence_interval: desired }));
    }
  }, [form.recurrence_frequency, form.recurrence_interval]);

  // Construir preview humano
  useEffect(() => {
    if (!form.is_recurring || !form.recurrence_frequency) {
      setForm((prev) => ({ ...prev, recurrence_summary: "" }));
      return;
    }

    let summary = "";
    const sd = form.start_date ? new Date(form.start_date) : null;
    const ed = form.end_date ? new Date(form.end_date) : null;

    const rango =
      sd && ed
        ? ` del ${sd.toLocaleDateString()} al ${ed.toLocaleDateString()}`
        : sd
        ? ` desde el ${sd.toLocaleDateString()}`
        : "";

    switch (form.recurrence_frequency) {
      case "DAILY":
        summary = "Diariamente";
        break;
      case "WEEKLY": {
        const dias =
          form.recurrence_byweekday.length > 0
            ? form.recurrence_byweekday
                .map(
                  (code) => WEEKDAYS.find((w) => w.code === code)?.label || code
                )
                .join(", ")
            : "—";
        const cada =
          form.recurrence_interval && form.recurrence_interval > 1
            ? `cada ${form.recurrence_interval} semanas`
            : "semanal";
        summary = `${cada} (${dias})`;
        break;
      }
      case "BIWEEKLY": {
        const dias =
          form.recurrence_byweekday.length > 0
            ? form.recurrence_byweekday
                .map(
                  (code) => WEEKDAYS.find((w) => w.code === code)?.label || code
                )
                .join(", ")
            : "—";
        summary = `Cada 2 semanas (${dias})`;
        break;
      }
      case "MONTHLY": {
        summary = form.recurrence_bymonthday
          ? `Mensual el día ${form.recurrence_bymonthday}`
          : "Mensual (día sin especificar)";
        break;
      }
      default:
        summary = "";
    }

    setForm((prev) => ({ ...prev, recurrence_summary: summary + rango }));
  }, [
    form.is_recurring,
    form.recurrence_frequency,
    form.recurrence_interval,
    form.recurrence_byweekday,
    form.recurrence_bymonthday,
    form.start_date,
    form.end_date,
  ]);

  const validate = () => {
    const newErrors = {};
    if (!form.client_id) newErrors.client_id = "El cliente es obligatorio";
    if (!form.name.trim()) newErrors.name = "El nombre es obligatorio";

    if (form.is_recurring) {
      if (!form.recurrence_frequency) {
        newErrors.recurrence_frequency = "Selecciona una frecuencia";
      } else if (
        (form.recurrence_frequency === "WEEKLY" ||
          form.recurrence_frequency === "BIWEEKLY") &&
        form.recurrence_byweekday.length === 0
      ) {
        newErrors.recurrence_byweekday = "Elige al menos un día";
      } else if (form.recurrence_frequency === "MONTHLY") {
        const d = Number(form.recurrence_bymonthday);
        if (!d || d < 1 || d > 31)
          newErrors.recurrence_bymonthday = "Día del mes inválido (1–31)";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    // Normalizo valores a guardar
    const payload = {
      client_id: form.client_id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,

      is_recurring: !!form.is_recurring,
      recurrence_frequency: form.is_recurring
        ? form.recurrence_frequency || null
        : null,
      recurrence_interval:
        form.is_recurring &&
        (form.recurrence_frequency === "WEEKLY" ||
          form.recurrence_frequency === "BIWEEKLY")
          ? Number(
              form.recurrence_interval ||
                (form.recurrence_frequency === "BIWEEKLY" ? 2 : 1)
            )
          : 1,
      recurrence_byweekday:
        form.is_recurring &&
        (form.recurrence_frequency === "WEEKLY" ||
          form.recurrence_frequency === "BIWEEKLY")
          ? form.recurrence_byweekday
          : null,
      recurrence_bymonthday:
        form.is_recurring && form.recurrence_frequency === "MONTHLY"
          ? Number(form.recurrence_bymonthday)
          : null,
      recurrence_summary: form.is_recurring
        ? form.recurrence_summary || null
        : null,
    };

    const { error } = await supabase.from("projects").insert([payload]);

    setLoading(false);

    if (error) {
      toast.error("Error al registrar proyecto: " + error.message);
    } else {
      toast.success("Proyecto registrado con éxito");
      setForm({
        client_id: "",
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        is_recurring: false,
        recurrence_frequency: "",
        recurrence_interval: 1,
        recurrence_byweekday: [],
        recurrence_bymonthday: "",
        recurrence_summary: "",
      });
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto space-y-5 bg-white border border-gray-300 rounded-xl p-8 shadow-md"
      autoComplete="off"
    >
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-700">Registrar Proyecto</h2>
        <FaPlus className="text-blue-600 text-xl" />
      </div>

      {/* Selección de cliente */}
      <div>
        <label
          htmlFor="client_id"
          className="block font-semibold mb-1 text-blue-700"
        >
          Cliente <span className="text-red-600">*</span>
        </label>
        <select
          id="client_id"
          name="client_id"
          value={form.client_id}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.client_id
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          required
          disabled={loading}
        >
          <option value="">Selecciona un cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.company_name}
            </option>
          ))}
        </select>
        {errors.client_id && (
          <span className="text-xs text-red-600">{errors.client_id}</span>
        )}
      </div>

      {/* Nombre */}
      <div>
        <label
          htmlFor="name"
          className="block font-semibold mb-1 text-blue-700"
        >
          Nombre <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Nombre del proyecto"
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.name
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          value={form.name}
          onChange={handleChange}
          disabled={loading}
        />
        {errors.name && (
          <span className="text-xs text-red-600">{errors.name}</span>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label
          htmlFor="description"
          className="block font-semibold mb-1 text-blue-700"
        >
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Descripción del proyecto"
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
          value={form.description}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="start_date"
            className="block font-semibold mb-1 text-blue-700"
          >
            Fecha de inicio
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={form.start_date}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="end_date"
            className="block font-semibold mb-1 text-blue-700"
          >
            Fecha de fin
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={form.end_date}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      {/* Recurrencia */}
      <fieldset className="border border-gray-200 rounded-lg p-4">
        <legend className="px-2 text-blue-700 font-semibold">
          Recurrencia (opcional)
        </legend>

        <div className="flex items-center gap-3 mb-3">
          <input
            id="is_recurring"
            name="is_recurring"
            type="checkbox"
            checked={form.is_recurring}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="is_recurring" className="font-medium">
            ¿Es recurrente?
          </label>
        </div>

        {form.is_recurring && (
          <div className="space-y-3">
            <div>
              <label
                htmlFor="recurrence_frequency"
                className="block font-semibold mb-1 text-blue-700"
              >
                Frecuencia
              </label>
              <select
                id="recurrence_frequency"
                name="recurrence_frequency"
                value={form.recurrence_frequency}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.recurrence_frequency
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-400"
                }`}
                disabled={loading}
              >
                <option value="">Selecciona frecuencia</option>
                <option value="DAILY">Diario</option>
                <option value="WEEKLY">Semanal</option>
                <option value="BIWEEKLY">Quincenal</option>
                <option value="MONTHLY">Mensual</option>
              </select>
              {errors.recurrence_frequency && (
                <span className="text-xs text-red-600">
                  {errors.recurrence_frequency}
                </span>
              )}
            </div>

            {(form.recurrence_frequency === "WEEKLY" ||
              form.recurrence_frequency === "BIWEEKLY") && (
              <>
                <div>
                  <span className="block font-semibold mb-1 text-blue-700">
                    Días de visita
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((d) => (
                      <label
                        key={d.code}
                        className="inline-flex items-center gap-2 border border-gray-300 rounded px-2 py-1 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.recurrence_byweekday.includes(d.code)}
                          onChange={() => handleWeekdayToggle(d.code)}
                          disabled={loading}
                        />
                        <span>{d.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.recurrence_byweekday && (
                    <span className="text-xs text-red-600">
                      {errors.recurrence_byweekday}
                    </span>
                  )}
                </div>

                {form.recurrence_frequency === "WEEKLY" && (
                  <div>
                    <label
                      htmlFor="recurrence_interval"
                      className="block font-semibold mb-1 text-blue-700"
                    >
                      Cada cuántas semanas
                    </label>
                    <input
                      id="recurrence_interval"
                      name="recurrence_interval"
                      type="number"
                      min={1}
                      value={form.recurrence_interval}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      disabled={loading}
                    />
                  </div>
                )}
              </>
            )}

            {form.recurrence_frequency === "MONTHLY" && (
              <div>
                <label
                  htmlFor="recurrence_bymonthday"
                  className="block font-semibold mb-1 text-blue-700"
                >
                  Día del mes
                </label>
                <input
                  id="recurrence_bymonthday"
                  name="recurrence_bymonthday"
                  type="number"
                  min={1}
                  max={31}
                  value={form.recurrence_bymonthday}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.recurrence_bymonthday
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-blue-400"
                  }`}
                  disabled={loading}
                />
                {errors.recurrence_bymonthday && (
                  <span className="text-xs text-red-600">
                    {errors.recurrence_bymonthday}
                  </span>
                )}
              </div>
            )}

            {/* Preview */}
            {form.recurrence_summary && (
              <div className="mt-2 text-sm text-gray-700">
                <span className="font-semibold text-blue-700">Resumen: </span>
                {form.recurrence_summary}
              </div>
            )}
          </div>
        )}
      </fieldset>

      {/* Botón */}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold py-3 rounded-md shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        <FaPlus />
        {loading ? "Guardando..." : "Registrar Proyecto"}
      </button>
    </form>
  );
}
