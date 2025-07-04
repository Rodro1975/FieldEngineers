"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import Modal from "./Modal";

export default function EditEngineer({ engineer, onClose, onSuccess }) {
  const [form, setForm] = useState({
    full_name: "",
    city: "",
    skills: "",
    english_level: "",
    email: "",
    telephone: "",
    proyect: "",
    available: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (engineer) {
      setForm({
        full_name: engineer.full_name || "",
        city: engineer.city || "",
        skills: (engineer.skills || []).join(", "),
        english_level: engineer.english_level || "",
        email: engineer.email || "",
        telephone: engineer.telephone || "",
        proyect: engineer.proyect || "",
        available: engineer.available || false,
      });
      setErrors({});
    }
  }, [engineer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.full_name.trim())
      newErrors.full_name = "El nombre es obligatorio";
    if (!form.city.trim()) newErrors.city = "La ciudad es obligatoria";
    if (!form.skills.trim())
      newErrors.skills = "Las habilidades son obligatorias";
    if (!form.english_level)
      newErrors.english_level = "Selecciona un nivel de inglés";
    if (!form.email.trim()) newErrors.email = "El correo es obligatorio";
    if (!form.telephone.trim())
      newErrors.telephone = "El teléfono es obligatorio";
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
      .from("engineers")
      .update({
        full_name: form.full_name.trim(),
        city: form.city.trim(),
        skills: form.skills.split(",").map((s) => s.trim()),
        english_level: form.english_level,
        email: form.email.trim(),
        telephone: form.telephone.trim(),
        proyect: form.proyect.trim() || null,
        available: form.available,
      })
      .eq("id", engineer.id);

    setLoading(false);

    if (error) {
      toast.error("Error al actualizar: " + error.message);
    } else {
      toast.success("Ingeniero actualizado");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }
  };

  return (
    <Modal show={!!engineer} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[70vh] overflow-y-auto"
      >
        <h3 className="text-xl font-bold text-blue-700 mb-2">
          Editar Ingeniero
        </h3>

        {/* Campos del formulario */}
        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Nombre completo <span className="text-red-600">*</span>
          </label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.full_name
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-blue-400"
            }`}
            required
          />
          {errors.full_name && (
            <span className="text-xs text-red-600">{errors.full_name}</span>
          )}
        </div>

        {/* Repite para los demás campos... */}
        {/* Ciudad */}
        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Ciudad <span className="text-red-600">*</span>
          </label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.city
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-blue-400"
            }`}
            required
          />
          {errors.city && (
            <span className="text-xs text-red-600">{errors.city}</span>
          )}
        </div>

        {/* Habilidades */}
        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Habilidades (separadas por coma){" "}
            <span className="text-red-600">*</span>
          </label>
          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.skills
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-blue-400"
            }`}
            required
          />
          {errors.skills && (
            <span className="text-xs text-red-600">{errors.skills}</span>
          )}
        </div>

        {/* Nivel de inglés */}
        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Nivel de inglés <span className="text-red-600">*</span>
          </label>
          <select
            name="english_level"
            value={form.english_level}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.english_level
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-blue-400"
            }`}
            required
          >
            <option value="">Selecciona nivel</option>
            <option value="básico">Básico</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
            <option value="nativo">Nativo</option>
          </select>
          {errors.english_level && (
            <span className="text-xs text-red-600">{errors.english_level}</span>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Correo electrónico <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-blue-400"
            }`}
            required
          />
          {errors.email && (
            <span className="text-xs text-red-600">{errors.email}</span>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Teléfono <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="telephone"
            inputMode="numeric"
            maxLength={10}
            value={form.telephone}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.telephone
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-blue-400"
            }`}
            required
          />
          {errors.telephone && (
            <span className="text-xs text-red-600">{errors.telephone}</span>
          )}
        </div>

        {/* Proyecto asignado */}
        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Proyecto asignado
          </label>
          <input
            name="proyect"
            value={form.proyect}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Disponible */}
        <div className="flex items-center gap-2">
          <input
            id="available"
            name="available"
            type="checkbox"
            checked={form.available}
            onChange={handleChange}
            className="border border-gray-300 accent-blue-600"
          />
          <label htmlFor="available" className="font-semibold text-blue-700">
            Disponible para asignación
          </label>
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
