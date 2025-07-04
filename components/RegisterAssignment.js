"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function RegisterAssignment({ onSuccess, onClose }) {
  const [projects, setProjects] = useState([]);
  const [engineers, setEngineers] = useState([]);

  const [form, setForm] = useState({
    project_id: "",
    engineer_id: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar proyectos y ingenieros para los selects
  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) {
        toast.error("Error al cargar proyectos: " + error.message);
      } else {
        setProjects(data);
      }
    }

    async function fetchEngineers() {
      const { data, error } = await supabase
        .from("engineers")
        .select("id, full_name")
        .order("full_name", { ascending: true });
      if (error) {
        toast.error("Error al cargar ingenieros: " + error.message);
      } else {
        setEngineers(data);
      }
    }

    fetchProjects();
    fetchEngineers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.project_id) newErrors.project_id = "Selecciona un proyecto";
    if (!form.engineer_id) newErrors.engineer_id = "Selecciona un ingeniero";
    if (!form.role.trim()) newErrors.role = "El rol es obligatorio";
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

    const { error } = await supabase.from("assignments").insert([
      {
        project_id: form.project_id,
        engineer_id: form.engineer_id,
        role: form.role.trim(),
        assigned_at: new Date().toISOString(),
      },
    ]);

    setLoading(false);

    if (error) {
      toast.error("Error al registrar asignación: " + error.message);
    } else {
      toast.success("Asignación registrada con éxito");
      setForm({
        project_id: "",
        engineer_id: "",
        role: "",
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
        Nueva Asignación
      </h2>

      <div>
        <label
          htmlFor="project_id"
          className="block font-semibold mb-1 text-blue-700"
        >
          Proyecto <span className="text-red-600">*</span>
        </label>
        <select
          id="project_id"
          name="project_id"
          value={form.project_id}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.project_id
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          required
          disabled={loading}
        >
          <option value="">Selecciona un proyecto</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {errors.project_id && (
          <span className="text-xs text-red-600">{errors.project_id}</span>
        )}
      </div>

      <div>
        <label
          htmlFor="engineer_id"
          className="block font-semibold mb-1 text-blue-700"
        >
          Ingeniero <span className="text-red-600">*</span>
        </label>
        <select
          id="engineer_id"
          name="engineer_id"
          value={form.engineer_id}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.engineer_id
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          required
          disabled={loading}
        >
          <option value="">Selecciona un ingeniero</option>
          {engineers.map((engineer) => (
            <option key={engineer.id} value={engineer.id}>
              {engineer.full_name}
            </option>
          ))}
        </select>
        {errors.engineer_id && (
          <span className="text-xs text-red-600">{errors.engineer_id}</span>
        )}
      </div>

      <div>
        <label
          htmlFor="role"
          className="block font-semibold mb-1 text-blue-700"
        >
          Rol <span className="text-red-600">*</span>
        </label>
        <input
          id="role"
          name="role"
          type="text"
          placeholder="Ej: Líder de proyecto, Desarrollador"
          value={form.role}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.role
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          required
          disabled={loading}
        />
        {errors.role && (
          <span className="text-xs text-red-600">{errors.role}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold py-3 rounded-md shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Guardando..." : "Registrar Asignación"}
      </button>
    </form>
  );
}
