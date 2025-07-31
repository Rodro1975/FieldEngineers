"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";
import { toast, Toaster } from "react-hot-toast";

export default function RegisterIncome({ onSuccess }) {
  const [formData, setFormData] = useState({
    client_id_service: "",
    client_id_payer: "",
    project_id: "",
    custom_project_name: "",
    activity: "",
    notes: "",
    hours_worked: 0,
    profile_id: "",
    service_date: "",
  });

  const [manualRate, setManualRate] = useState(false);
  const [rateInput, setRateInput] = useState("");

  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: clientsData } = await supabase
        .from("clients")
        .select("id, company_name");

      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, name");

      setClients(clientsData || []);
      setProjects(projectsData || []);

      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;

      if (error || !user) {
        toast.error("No se pudo obtener el usuario autenticado");
        return;
      }

      setFormData((prev) => ({ ...prev, profile_id: user.id }));
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      client_id_service,
      client_id_payer,
      activity,
      hours_worked,
      profile_id,
      project_id,
      custom_project_name,
      notes,
      service_date,
    } = formData;

    if (
      !client_id_service ||
      !client_id_payer ||
      !activity.trim() ||
      hours_worked < 0 ||
      !profile_id ||
      !service_date ||
      (project_id === "otro" && !custom_project_name.trim())
    ) {
      return toast.error("Completa todos los campos correctamente");
    }

    const { data: rateData, error: rateError } = await supabase
      .from("client_rates")
      .select("hourly_rate, half_day_rate, full_day_rate, extra_hour_rate")
      .eq("client_id", client_id_payer)
      .eq("vigente", true)
      .single();

    if (rateError || !rateData) {
      return toast.error(
        "No se encontró tarifa vigente para el cliente pagador"
      );
    }

    let rate_type = "por_hora";
    let rate_applied = rateData.hourly_rate;
    const hours = Number(hours_worked);

    if (manualRate) {
      rate_applied = Number(rateInput);
      if (isNaN(rate_applied) || rate_applied < 0) {
        return toast.error("Tarifa manual inválida");
      }
      rate_type = "manual";
    } else {
      if (hours >= 4 && hours < 6 && rateData.half_day_rate > 0) {
        rate_type = "media_jornada";
        rate_applied = rateData.half_day_rate;
      } else if (hours >= 6 && hours <= 8 && rateData.full_day_rate > 0) {
        rate_type = "jornada_completa";
        rate_applied = rateData.full_day_rate;
      } else if (hours > 8 && rateData.extra_hour_rate > 0) {
        rate_type = "hora_extra";
        rate_applied = rateData.extra_hour_rate * hours;
      } else {
        rate_applied = rateData.hourly_rate * hours;
      }
    }

    const total_usd = rate_applied;
    const conversion_rate = 17.5;
    const total_mxn = total_usd * conversion_rate;

    // Calcular fecha estimada de pago a 30 días
    const dueDate = new Date(service_date);
    dueDate.setDate(dueDate.getDate() + 30);
    const due_date_iso = dueDate.toISOString();

    const payload = {
      client_id_service,
      client_id_payer,
      project_id: project_id === "otro" ? null : project_id,
      custom_project_name:
        project_id === "otro" ? custom_project_name.trim() : null,
      activity: activity.trim(),
      notes: notes?.trim() || null,
      hours_worked: hours,
      profile_id,
      rate_type,
      rate_applied: total_usd,
      total_usd,
      conversion_rate,
      total_mxn,
      anulado: false,
      override_tarifa: manualRate,
      service_date,
      due_date: due_date_iso,
    };

    const { error: insertError } = await supabase
      .from("incomes")
      .insert([payload]);

    if (insertError) {
      console.error(insertError);
      return toast.error("Error al registrar ingreso");
    }

    toast.success("Ingreso registrado correctamente");
    onSuccess();
  };

  return (
    <div className="space-y-4 p-4">
      <Toaster />
      <h2 className="text-xl font-bold text-blue-900">Registrar Ingreso</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Cliente servicio */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Cliente (servicio)
          </label>
          <select
            name="client_id_service"
            value={formData.client_id_service}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Selecciona un cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name}
              </option>
            ))}
          </select>
        </div>

        {/* Cliente pagador */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Cliente (pagador)
          </label>
          <select
            name="client_id_payer"
            value={formData.client_id_payer}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Selecciona un cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name}
              </option>
            ))}
          </select>
        </div>

        {/* Proyecto */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Proyecto (opcional)
          </label>
          <select
            name="project_id"
            value={formData.project_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Selecciona un proyecto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value="otro">Otro (escribir manualmente)</option>
          </select>
        </div>

        {formData.project_id === "otro" && (
          <div className="mt-2">
            <input
              type="text"
              name="custom_project_name"
              value={formData.custom_project_name}
              onChange={handleChange}
              placeholder="Nombre del proyecto"
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}

        {/* Fecha ejecución */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Fecha de ejecución del servicio
          </label>
          <input
            type="date"
            name="service_date"
            value={formData.service_date}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Horas trabajadas */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Horas trabajadas
          </label>
          <input
            type="number"
            name="hours_worked"
            value={formData.hours_worked}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            min="0"
            step="0.1"
            placeholder="Ej. 4.5"
          />
        </div>

        {/* Tarifa manual */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="manualRate"
            checked={manualRate}
            onChange={() => setManualRate(!manualRate)}
          />
          <label htmlFor="manualRate" className="text-sm text-gray-700">
            Ingresar tarifa manual
          </label>
        </div>

        {manualRate && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Tarifa manual (USD)
            </label>
            <input
              type="number"
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              className="w-full p-2 border rounded"
              min={0}
              step={0.01}
              required
            />
          </div>
        )}

        {/* Actividad */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Descripción del servicio
          </label>
          <input
            type="text"
            name="activity"
            value={formData.activity}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            placeholder="Ej. Diagnóstico de red"
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Notas adicionales (opcional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded shadow"
        >
          Registrar Ingreso
        </button>
      </form>
    </div>
  );
}
