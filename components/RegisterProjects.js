"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import supabase from "@/lib/supabaseClient";
import { FaPlus } from "react-icons/fa";

export default function RegisterProject({ onSuccess }) {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    client_id: "",
    name: "",
    description: "",
    start_date: "",
    end_date: "",
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
        setClients(data);
      }
    }
    fetchClients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.client_id) newErrors.client_id = "El cliente es obligatorio";
    if (!form.name.trim()) newErrors.name = "El nombre es obligatorio";
    // Puedes agregar más validaciones si quieres
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

    const { error } = await supabase.from("projects").insert([
      {
        client_id: form.client_id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      },
    ]);

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
