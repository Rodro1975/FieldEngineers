"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import Modal from "./Modal";

export default function EditAssignments({ assignment, onClose, onSuccess }) {
  const [form, setForm] = useState({
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (assignment) {
      setForm({
        role: assignment.role || "",
      });
      setErrors({});
    }
  }, [assignment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
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

    const { error } = await supabase
      .from("assignments")
      .update({
        role: form.role.trim(),
        assigned_at: new Date().toISOString(),
      })
      .match({
        project_id: assignment.project_id,
        engineer_id: assignment.engineer_id,
      });

    setLoading(false);

    if (error) {
      toast.error("Error al actualizar: " + error.message);
    } else {
      toast.success("Asignación actualizada");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }
  };

  return (
    <Modal show={!!assignment} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[70vh] overflow-y-auto"
      >
        <h3 className="text-xl font-bold text-blue-700 mb-2">
          Editar Asignación
        </h3>

        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Proyecto
          </label>
          <input
            type="text"
            value={assignment.projects?.name || ""}
            disabled
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Ingeniero
          </label>
          <input
            type="text"
            value={assignment.engineers?.full_name || ""}
            disabled
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Rol <span className="text-red-600">*</span>
          </label>
          <input
            name="role"
            value={form.role}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.role
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-blue-400"
            }`}
            required
          />
          {errors.role && (
            <span className="text-xs text-red-600">{errors.role}</span>
          )}
        </div>

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
