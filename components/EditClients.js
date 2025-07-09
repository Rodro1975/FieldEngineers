"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import Modal from "./Modal";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function EditClients({ client, onClose, onSuccess }) {
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        company_name: client.company_name || "",
        contact_name: client.contact_name || "",
        contact_email: client.contact_email || "",
        contact_phone: client.contact_phone || "",
        address: client.address || "",
      });
      setErrors({});
    }
  }, [client]);

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
    if (form.contact_phone && !/^\+\d{6,15}$/.test(form.contact_phone)) {
      newErrors.contact_phone =
        "Número inválido. Usa formato internacional (ej. +521234567890)";
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

    const { error } = await supabase
      .from("clients")
      .update({
        company_name: form.company_name.trim(),
        contact_name: form.contact_name.trim(),
        contact_email: form.contact_email.trim(),
        contact_phone: form.contact_phone || null,
        address: form.address.trim() || null,
      })
      .eq("id", client.id);

    setLoading(false);

    if (error) {
      toast.error("Error al actualizar: " + error.message);
    } else {
      toast.success("Cliente actualizado");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }
  };

  return (
    <Modal show={!!client} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[70vh] overflow-y-auto"
      >
        <h3 className="text-xl font-bold text-blue-700 mb-2">Editar Cliente</h3>

        {/* Empresa */}
        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Nombre de la empresa <span className="text-red-600">*</span>
          </label>
          <input
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.company_name
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-blue-400"
            }`}
          />
          {errors.company_name && (
            <span className="text-xs text-red-600">{errors.company_name}</span>
          )}
        </div>

        {/* Contacto */}
        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Nombre del contacto <span className="text-red-600">*</span>
          </label>
          <input
            name="contact_name"
            value={form.contact_name}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.contact_name
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-blue-400"
            }`}
          />
          {errors.contact_name && (
            <span className="text-xs text-red-600">{errors.contact_name}</span>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Correo electrónico <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            name="contact_email"
            value={form.contact_email}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.contact_email
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-blue-400"
            }`}
          />
          {errors.contact_email && (
            <span className="text-xs text-red-600">{errors.contact_email}</span>
          )}
        </div>

        {/* Teléfono con bandera */}
        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Teléfono
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
          <label className="block font-semibold mb-1 text-blue-700">
            Dirección
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows={3}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold py-2 px-6 rounded-md shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
