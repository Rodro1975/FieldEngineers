"use client";

import { useState } from "react";
import supabase from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { z } from "zod";

const schema = z.object({
  company_name: z.string().min(1, "Campo obligatorio"),
  contact_name: z.string().min(1, "Campo obligatorio"),
  contact_email: z.string().email("Correo no válido"),
  contact_phone: z
    .string()
    .regex(
      /^\+\d{6,15}$/,
      "Número telefónico inválido. Usa formato internacional (ej. +521234567890)"
    ),
});

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      toast.error("Corrige los errores del formulario");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("clients").insert([
      {
        company_name: form.company_name.trim(),
        contact_name: form.contact_name.trim(),
        contact_email: form.contact_email.trim(),
        contact_phone: form.contact_phone.trim(),
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

      {/* Empresa */}
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
          value={form.company_name}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.company_name
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          disabled={loading}
        />
        {errors.company_name && (
          <span className="text-xs text-red-600">{errors.company_name}</span>
        )}
      </div>

      {/* Contacto */}
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
          value={form.contact_name}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.contact_name
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          disabled={loading}
        />
        {errors.contact_name && (
          <span className="text-xs text-red-600">{errors.contact_name}</span>
        )}
      </div>

      {/* Correo */}
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
          value={form.contact_email}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.contact_email
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          disabled={loading}
        />
        {errors.contact_email && (
          <span className="text-xs text-red-600">{errors.contact_email}</span>
        )}
      </div>

      {/* Teléfono con bandera */}
      <div>
        <label
          htmlFor="contact_phone"
          className="block font-semibold mb-1 text-blue-700"
        >
          Teléfono <span className="text-red-600">*</span>
        </label>
        <PhoneInput
          international
          defaultCountry="MX"
          value={form.contact_phone}
          onChange={(value) => {
            setForm((prev) => ({ ...prev, contact_phone: value || "" }));
            setErrors((prev) => ({ ...prev, contact_phone: null }));
          }}
          className={`react-phone-input w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
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

      {/* Dirección */}
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
