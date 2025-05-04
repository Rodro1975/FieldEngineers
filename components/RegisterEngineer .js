"use client";
import { useState } from "react";
import supabase from "@/lib/supabaseClient";

export default function RegisterEngineer({ onSuccess }) {
  const [form, setForm] = useState({
    full_name: "",
    city: "",
    skills: "",
    english_level: "A1",
    email: "",
    telephone: "",
    proyect: "",
    available: true,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    // Validaciones básicas
    if (
      !form.full_name ||
      !form.city ||
      !form.skills ||
      !form.email ||
      !form.telephone
    ) {
      setMessage("Por favor, completa todos los campos obligatorios.");
      setLoading(false);
      return;
    }
    // Validación de email simple
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setMessage("El correo electrónico no es válido.");
      setLoading(false);
      return;
    }
    // Validación de teléfono (solo números)
    if (!/^\d+$/.test(form.telephone)) {
      setMessage("El teléfono debe contener solo números.");
      setLoading(false);
      return;
    }

    const payload = {
      full_name: form.full_name,
      city: form.city,
      skills: form.skills.split(",").map((s) => s.trim()),
      english_level: form.english_level,
      available: form.available,
      proyect: form.proyect || null,
      email: form.email,
      telephone: form.telephone,
    };
    const { error } = await supabase.from("engineers").insert([payload]);
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("✅ Ingeniero registrado");
      onSuccess?.();
      setForm({
        full_name: "",
        city: "",
        skills: "",
        english_level: "A1",
        email: "",
        telephone: "",
        proyect: "",
        available: true,
      });
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto space-y-5 bg-white border border-black rounded-lg p-8"
    >
      <div>
        <label className="block font-semibold mb-1">Nombre completo *</label>
        <input
          name="full_name"
          type="text"
          className="w-full border border-black rounded px-3 py-2"
          value={form.full_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Ciudad *</label>
        <input
          name="city"
          type="text"
          className="w-full border border-black rounded px-3 py-2"
          value={form.city}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">
          Habilidades (separadas por coma) *
        </label>
        <input
          name="skills"
          type="text"
          placeholder="Ej: electricidad, hidráulica, PLC"
          className="w-full border border-black rounded px-3 py-2"
          value={form.skills}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Nivel de inglés *</label>
        <select
          name="english_level"
          className="w-full border border-black rounded px-3 py-2"
          value={form.english_level}
          onChange={handleChange}
        >
          <option value="A1">A1 (Básico)</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2 (Intermedio)</option>
          <option value="C1">C1</option>
          <option value="C2">C2 (Avanzado)</option>
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1">Correo electrónico *</label>
        <input
          name="email"
          type="email"
          className="w-full border border-black rounded px-3 py-2"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Teléfono *</label>
        <input
          name="telephone"
          type="text"
          placeholder="Solo números"
          className="w-full border border-black rounded px-3 py-2"
          value={form.telephone}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Proyecto asignado</label>
        <input
          name="proyect"
          type="text"
          placeholder="(Opcional)"
          className="w-full border border-black rounded px-3 py-2"
          value={form.proyect}
          onChange={handleChange}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          name="available"
          type="checkbox"
          checked={form.available}
          onChange={handleChange}
          className="border border-black"
        />
        <label className="font-semibold">Disponible para asignación</label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-black border border-black px-4 py-2 rounded font-semibold hover:bg-black hover:text-white transition"
      >
        {loading ? "Registrando..." : "Registrar"}
      </button>
      {message && (
        <p
          className={`text-sm ${
            message.startsWith("Error") ? "text-red-600" : "text-green-700"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
