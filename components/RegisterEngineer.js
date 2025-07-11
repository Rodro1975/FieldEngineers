"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import toast, { Toaster } from "react-hot-toast";
import supabase from "@/lib/supabaseClient";
import { FaUserPlus } from "react-icons/fa6";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const schema = z.object({
  full_name: z.string().min(1, "Campo obligatorio"),
  city: z.string().min(1, "Campo obligatorio"),
  skills: z.string().min(1, "Introduce al menos una habilidad"),
  english_level: z.enum(["Sin inglés", "A1", "A2", "B1", "B2", "C1", "C2"]),
  email: z.string().email("Correo no válido"),
  telephone: z
    .string()
    .regex(
      /^\+\d{6,15}$/,
      "Número telefónico inválido. Usa formato internacional (ej. +521234567890)"
    ),
  proyect: z.string().optional(),
  available: z.boolean(),
  user_id: z.string().uuid(),
});

const ENGLISH_LEVELS = [
  { value: "", label: "Selecciona el nivel de inglés" },
  { value: "Sin inglés", label: "Sin inglés" },
  { value: "A1", label: "A1 (Básico)" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2 (Intermedio)" },
  { value: "C1", label: "C1" },
  { value: "C2", label: "C2 (Avanzado)" },
];

export default function RegisterEngineer({ onSuccess }) {
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    city: "",
    skills: "",
    english_level: "",
    email: "",
    telephone: "",
    proyect: "",
    available: true,
    user_id: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Obtener userId del usuario autenticado y actualizar form.user_id
  useEffect(() => {
    async function fetchSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const id = session.user.id;
        setUserId(id);
        setForm((prev) => ({ ...prev, user_id: id }));
      } else {
        // Manejar si no hay sesión (usuario no autenticado)
        toast.error("No se ha detectado usuario autenticado");
      }
    }
    fetchSession();
  }, []);

  const validateField = (name, value) => {
    try {
      schema.pick({ [name]: true }).parse({ [name]: value });
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    } catch (e) {
      setErrors((prev) => ({ ...prev, [name]: e.errors[0].message }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    // Limitar teléfono a 10 dígitos y solo números
    if (name === "telephone") {
      val = val.replace(/\D/g, "").slice(0, 10);
    }

    setForm((prev) => ({ ...prev, [name]: val }));
    validateField(name, val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Asegurarse que user_id esté definido antes de validar
    if (!form.user_id) {
      toast.error("Usuario no autenticado");
      setLoading(false);
      return;
    }

    const result = schema.safeParse(form);
    if (!result.success) {
      console.log("Errores de validación:", result.error);
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      toast.error("Por favor, corrige los errores.");
      setLoading(false);
      return;
    }

    const payload = {
      full_name: form.full_name.trim(),
      city: form.city.trim(),
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      english_level: form.english_level === "" ? null : form.english_level,
      available: form.available,
      proyect: form.proyect.trim() || null,
      email: form.email.trim(),
      telephone: form.telephone, // mejor dejar string, evita problemas con ceros a la izquierda
      user_id: form.user_id,
    };

    const { error } = await supabase.from("engineers").insert([payload]);
    if (error) {
      toast.error("Error: " + error.message);
    } else {
      toast.success("✅ Ingeniero registrado");
      onSuccess?.();
      setForm({
        full_name: "",
        city: "",
        skills: "",
        english_level: "",
        email: "",
        telephone: "",
        proyect: "",
        available: true,
        user_id: userId || "",
      });
      setErrors({});
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto space-y-5 bg-white border border-gray-300 rounded-xl p-8 shadow-md"
      autoComplete="off"
    >
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-700">
          Registrar Ingeniero
        </h2>
        <FaUserPlus className="text-blue-600 text-xl" />
      </div>

      {/* Nombre completo */}
      <div>
        <label
          htmlFor="full_name"
          className="block font-semibold mb-1 text-blue-700"
        >
          Nombre completo <span className="text-red-600">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          placeholder="Ej: Juan Pérez"
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.full_name
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          value={form.full_name}
          onChange={handleChange}
          disabled={loading}
        />
        {errors.full_name && (
          <span className="text-xs text-red-600">{errors.full_name}</span>
        )}
      </div>

      {/* Ciudad */}
      <div>
        <label
          htmlFor="city"
          className="block font-semibold mb-1 text-blue-700"
        >
          Ciudad <span className="text-red-600">*</span>
        </label>
        <input
          id="city"
          name="city"
          type="text"
          placeholder="Ej: Monterrey"
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.city
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          value={form.city}
          onChange={handleChange}
          disabled={loading}
        />
        {errors.city && (
          <span className="text-xs text-red-600">{errors.city}</span>
        )}
      </div>

      {/* Habilidades */}
      <div>
        <label
          htmlFor="skills"
          className="block font-semibold mb-1 text-blue-700"
        >
          Habilidades (separadas por coma){" "}
          <span className="text-red-600">*</span>
        </label>
        <input
          id="skills"
          name="skills"
          type="text"
          placeholder="Ej: electricidad, hidráulica, PLC"
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.skills
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          value={form.skills}
          onChange={handleChange}
          disabled={loading}
        />
        {errors.skills && (
          <span className="text-xs text-red-600">{errors.skills}</span>
        )}
      </div>

      {/* Nivel de inglés */}
      <div>
        <label
          htmlFor="english_level"
          className="block font-semibold mb-1 text-blue-700"
        >
          Nivel de inglés <span className="text-red-600">*</span>
        </label>
        <select
          id="english_level"
          name="english_level"
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.english_level
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          value={form.english_level}
          onChange={handleChange}
          disabled={loading}
        >
          {ENGLISH_LEVELS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.english_level && (
          <span className="text-xs text-red-600">{errors.english_level}</span>
        )}
      </div>

      {/* Correo electrónico */}
      <div>
        <label
          htmlFor="email"
          className="block font-semibold mb-1 text-blue-700"
        >
          Correo electrónico <span className="text-red-600">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Ej: juan@email.com"
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.email
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          value={form.email}
          onChange={handleChange}
          disabled={loading}
        />
        {errors.email && (
          <span className="text-xs text-red-600">{errors.email}</span>
        )}
      </div>

      {/* Teléfono con bandera e indicativo */}
      <div>
        <label
          htmlFor="telephone"
          className="block font-semibold mb-1 text-blue-700"
        >
          Teléfono <span className="text-red-600">*</span>
        </label>
        <PhoneInput
          international
          defaultCountry="MX"
          value={form.telephone}
          onChange={(value) => {
            setForm((prev) => ({ ...prev, telephone: value || "" }));
            validateField("telephone", value || "");
          }}
          className={`react-phone-input w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
            errors.telephone
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          disabled={loading}
        />
        {errors.telephone && (
          <span className="text-xs text-red-600">{errors.telephone}</span>
        )}
      </div>

      {/* Proyecto asignado */}
      <div>
        <label
          htmlFor="proyect"
          className="block font-semibold mb-1 text-blue-700"
        >
          Proyecto asignado
        </label>
        <input
          id="proyect"
          name="proyect"
          type="text"
          placeholder="(Opcional)"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={form.proyect}
          onChange={handleChange}
          disabled={loading}
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
          disabled={loading}
        />
        <label htmlFor="available" className="font-semibold text-blue-700">
          Disponible para asignación
        </label>
      </div>

      {/* Botón */}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold py-3 rounded-md shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        <FaUserPlus />
        {loading ? "Registrando..." : "Registrar"}
      </button>
    </form>
  );
}
