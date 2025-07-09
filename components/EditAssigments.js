"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import Modal from "./Modal";

const roles = [
  "Líder de Proyecto",
  "Ingeniero de Redes",
  "Ingeniero de Soporte",
  "Smart Hands",
  "Especialista en Seguridad",
  "Ingeniero de Campo",
  "Ingeniero de Configuración",
  "Técnico de Instalación",
  "Administrador de Sistemas",
  "Ingeniero de Pruebas",
  "Coordinador de Sitio",
  "Responsable de Documentación",
  "Ingeniero de Telecom",
  "Especialista en Energía",
  "Supervisor de Obra",
];

export default function EditAssignments({ assignment, onClose, onSuccess }) {
  const [projectAssignments, setProjectAssignments] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [newEngineer, setNewEngineer] = useState("");
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar ingenieros y asignaciones del proyecto
  useEffect(() => {
    if (!assignment) return;

    async function fetchEngineers() {
      const { data, error } = await supabase
        .from("engineers")
        .select("id, full_name");
      if (!error) setEngineers(data);
    }

    async function fetchAssignments() {
      const { data, error } = await supabase
        .from("assignments")
        .select("engineer_id, role, engineers(full_name)")
        .eq("project_id", assignment.project_id);
      if (!error) setProjectAssignments(data);
    }

    fetchEngineers();
    fetchAssignments();
    setErrors({});
    setNewEngineer("");
    setNewRole("");
  }, [assignment]);

  // Editar rol de un ingeniero ya asignado
  const handleRoleChange = (idx, value) => {
    setProjectAssignments((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, role: value } : a))
    );
  };

  // Guardar cambios de roles existentes
  const handleSaveRoles = async () => {
    setLoading(true);
    let hasError = false;

    for (const a of projectAssignments) {
      if (!a.role) {
        toast.error("Todos los roles son obligatorios");
        hasError = true;
        break;
      }
      const { error } = await supabase
        .from("assignments")
        .update({
          role: a.role,
          assigned_at: new Date().toISOString(),
        })
        .match({
          project_id: assignment.project_id,
          engineer_id: a.engineer_id,
        });
      if (error) {
        toast.error("Error al actualizar: " + error.message);
        hasError = true;
        break;
      }
    }

    setLoading(false);
    if (!hasError) {
      toast.success("Roles actualizados");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }
  };

  // Eliminar asignación de un ingeniero
  const handleDelete = async (engineer_id) => {
    setLoading(true);
    const { error } = await supabase.from("assignments").delete().match({
      project_id: assignment.project_id,
      engineer_id,
    });
    setLoading(false);
    if (error) {
      toast.error("Error al eliminar: " + error.message);
    } else {
      setProjectAssignments((prev) =>
        prev.filter((a) => a.engineer_id !== engineer_id)
      );
      toast.success("Ingeniero eliminado del proyecto");
    }
  };

  // Validar y agregar nuevo ingeniero
  const handleAddEngineer = async () => {
    if (!newEngineer) {
      setErrors({ newEngineer: "Selecciona un ingeniero" });
      return;
    }
    if (!newRole) {
      setErrors({ newRole: "Selecciona un rol" });
      return;
    }
    if (
      projectAssignments.some(
        (a) => String(a.engineer_id) === String(newEngineer)
      )
    ) {
      setErrors({ newEngineer: "Ingeniero ya asignado" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("assignments").insert([
      {
        project_id: assignment.project_id,
        engineer_id: newEngineer,
        role: newRole,
        assigned_at: new Date().toISOString(),
      },
    ]);
    setLoading(false);

    if (error) {
      toast.error("Error al agregar: " + error.message);
    } else {
      setProjectAssignments((prev) => [
        ...prev,
        {
          engineer_id: newEngineer,
          role: newRole,
          engineers: {
            full_name:
              engineers.find((e) => String(e.id) === String(newEngineer))
                ?.full_name || "",
          },
        },
      ]);
      setNewEngineer("");
      setNewRole("");
      setErrors({});
      toast.success("Ingeniero asignado");
    }
  };

  return (
    <Modal show={!!assignment} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveRoles();
        }}
        className="space-y-6 max-h-[80vh] overflow-y-auto p-2 sm:p-4"
      >
        <h3 className="text-2xl font-bold text-blue-700 mb-4">
          Editar Asignaciones de Proyecto
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
          <label className="block font-semibold mb-2 text-blue-700">
            Ingenieros Asignados
          </label>
          {projectAssignments.length === 0 ? (
            <p className="text-gray-500 italic">No hay ingenieros asignados.</p>
          ) : (
            <ul className="space-y-3">
              {projectAssignments.map((a, idx) => (
                <li
                  key={a.engineer_id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <span className="sm:col-span-5">
                    {a.engineers?.full_name || "Ingeniero desconocido"}
                  </span>
                  <select
                    value={a.role}
                    onChange={(e) => handleRoleChange(idx, e.target.value)}
                    className="sm:col-span-5 border rounded px-2 py-1 w-full"
                  >
                    <option value="">Selecciona un rol</option>
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.engineer_id)}
                    className="sm:col-span-2 text-red-600 hover:text-red-800 font-bold text-lg"
                    disabled={loading}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t pt-4 mt-4">
          <label className="block font-semibold mb-2 text-blue-700">
            Agregar Ingeniero al Proyecto
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <select
              value={newEngineer}
              onChange={(e) => {
                setNewEngineer(e.target.value);
                setErrors((prev) => ({ ...prev, newEngineer: null }));
              }}
              className={`sm:col-span-4 border rounded px-2 py-1 w-full ${
                errors.newEngineer ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Selecciona un ingeniero</option>
              {engineers
                .filter(
                  (e) =>
                    !projectAssignments.some(
                      (a) => String(a.engineer_id) === String(e.id)
                    )
                )
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name}
                  </option>
                ))}
            </select>

            <select
              value={newRole}
              onChange={(e) => {
                setNewRole(e.target.value);
                setErrors((prev) => ({ ...prev, newRole: null }));
              }}
              className={`sm:col-span-5 border rounded px-2 py-1 w-full ${
                errors.newRole ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Selecciona un rol</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddEngineer}
              className="sm:col-span-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded w-full sm:w-auto"
              disabled={loading}
            >
              Agregar
            </button>
          </div>
          {(errors.newEngineer || errors.newRole) && (
            <span className="text-xs text-red-600 block mt-1">
              {errors.newEngineer || errors.newRole}
            </span>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
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
