"use client";

import { useState } from "react";
import supabase from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function RegisterClients({ onSuccess, onClose }) {
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.company_name.trim())
      newErrors.company_name = "El nombre de la empresa es obligatorio";
    if (!form.contact_name.trim())
      newErrors.contact_name = "El nombre del contacto es obligatorio";
    if (!form.contact_email.trim()) {
      newErrors.contact_email = "El correo electrónico es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(form.contact_email)) {
      newErrors.contact_email = "El correo electrónico no es válido";
    }
    // Teléfono es opcional, pero si se ingresa, validar que solo tenga números
    if (form.contact_phone && !/^\d+$/.test(form.contact_phone)) {
      newErrors.contact_phone = "El teléfono solo debe contener números";
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

    const { error } = await supabase.from("clients").insert([
      {
        company_name: form.company_name.trim(),
        contact_name: form.contact_name.trim(),
        contact_email: form.contact_email.trim(),
        contact_phone: form.contact_phone.trim() || null,
        address: form.address.trim() || null,
      },
    ]);

    setLoading(false);

    if (error) {
      toast.error("Error al registrar cliente: " + error.message);
    } else {
      toast.success("Cliente registrado con éxito");
      setForm({
        company_name: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        address: "",
      });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 w-full max-w-md mx-auto p-4"
    >
      <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">
        Registrar Cliente
      </h2>

      <div>
        <label
          htmlFor="company_name"
          className="block font-semibold mb-1 text-blue-700"
        >
          Nombre de la empresa <span className="text-red-600">*</span>
        </label>
        <input
          id="company_name"
          name="company_name"
          type="text"
          placeholder="Ej: ACME Corp"
          value={form.company_name}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.company_name
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          required
          disabled={loading}
        />
        {errors.company_name && (
          <span className="text-xs text-red-600">{errors.company_name}</span>
        )}
      </div>

      <div>
        <label
          htmlFor="contact_name"
          className="block font-semibold mb-1 text-blue-700"
        >
          Nombre del contacto <span className="text-red-600">*</span>
        </label>
        <input
          id="contact_name"
          name="contact_name"
          type="text"
          placeholder="Ej: Juan Pérez"
          value={form.contact_name}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.contact_name
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          required
          disabled={loading}
        />
        {errors.contact_name && (
          <span className="text-xs text-red-600">{errors.contact_name}</span>
        )}
      </div>

      <div>
        <label
          htmlFor="contact_email"
          className="block font-semibold mb-1 text-blue-700"
        >
          Correo electrónico <span className="text-red-600">*</span>
        </label>
        <input
          id="contact_email"
          name="contact_email"
          type="email"
          placeholder="Ej: contacto@empresa.com"
          value={form.contact_email}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.contact_email
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          required
          disabled={loading}
        />
        {errors.contact_email && (
          <span className="text-xs text-red-600">{errors.contact_email}</span>
        )}
      </div>

      <div>
        <label
          htmlFor="contact_phone"
          className="block font-semibold mb-1 text-blue-700"
        >
          Teléfono
        </label>
        <input
          id="contact_phone"
          name="contact_phone"
          type="text"
          placeholder="Ej: 5551234567"
          value={form.contact_phone}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.contact_phone
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          disabled={loading}
        />
        {errors.contact_phone && (
          <span className="text-xs text-red-600">{errors.contact_phone}</span>
        )}
      </div>

      <div>
        <label
          htmlFor="address"
          className="block font-semibold mb-1 text-blue-700"
        >
          Dirección
        </label>
        <textarea
          id="address"
          name="address"
          placeholder="Ej: Calle Falsa 123, Ciudad"
          rows={3}
          value={form.address}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold py-3 rounded-md shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Guardando..." : "Registrar Cliente"}
      </button>
    </form>
  );
}
