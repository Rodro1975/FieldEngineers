"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import toast from "react-hot-toast";

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

export default function RegisterAssignment({ onSuccess, onClose }) {
  const [projects, setProjects] = useState([]);
  const [projectsWithAssignments, setProjectsWithAssignments] = useState([]);
  const [engineers, setEngineers] = useState([]);

  const [projectId, setProjectId] = useState("");
  const [currentEngineer, setCurrentEngineer] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [assignments, setAssignments] = useState([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar proyectos, ingenieros y proyectos con asignaciones
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

    async function fetchProjectsWithAssignments() {
      const { data, error } = await supabase
        .from("assignments")
        .select("project_id")
        .not("project_id", "is", null);

      if (error) {
        toast.error("Error al cargar asignaciones: " + error.message);
      } else {
        // Extraemos ids únicos
        const uniqueProjectIds = [
          ...new Set(data.map((a) => String(a.project_id))),
        ];
        setProjectsWithAssignments(uniqueProjectIds);
      }
    }

    fetchProjects();
    fetchEngineers();
    fetchProjectsWithAssignments();
  }, []);

  // Validar campos para agregar asignación temporal
  const validateAdd = () => {
    const newErrors = {};
    if (!currentEngineer) newErrors.currentEngineer = "Selecciona un ingeniero";
    if (!currentRole) newErrors.currentRole = "Selecciona un rol";
    if (
      assignments.some((a) => String(a.engineer_id) === String(currentEngineer))
    )
      newErrors.currentEngineer = "Este ingeniero ya fue agregado";
    return newErrors;
  };

  // Agregar asignación a la lista temporal
  const addAssignment = () => {
    if (projectsWithAssignments.includes(projectId)) {
      toast.error(
        "Este proyecto ya tiene asignaciones. Por favor usa la sección de edición."
      );
      return;
    }

    const validationErrors = validateAdd();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setAssignments((prev) => [
      ...prev,
      { engineer_id: currentEngineer, role: currentRole },
    ]);
    setCurrentEngineer("");
    setCurrentRole("");
    setErrors({});
  };

  // Eliminar asignación de la lista temporal
  const removeAssignment = (engineer_id) => {
    setAssignments((prev) =>
      prev.filter((a) => String(a.engineer_id) !== String(engineer_id))
    );
  };

  // Validar antes de guardar todas las asignaciones
  const validateSave = () => {
    const newErrors = {};
    if (!projectId) newErrors.projectId = "Selecciona un proyecto";
    if (assignments.length === 0)
      newErrors.assignments = "Agrega al menos un ingeniero con rol";
    if (projectsWithAssignments.includes(projectId))
      newErrors.projectId =
        "Este proyecto ya tiene asignaciones. Usa la edición.";
    return newErrors;
  };

  // Guardar todas las asignaciones en la base
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateSave();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.projectId) {
        toast.error(validationErrors.projectId);
      }
      return;
    }

    setLoading(true);

    const toInsert = assignments.map((a) => ({
      project_id: projectId,
      engineer_id: a.engineer_id,
      role: a.role,
      assigned_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("assignments").insert(toInsert);

    setLoading(false);

    if (error) {
      toast.error("Error al registrar asignaciones: " + error.message);
    } else {
      toast.success("Asignaciones registradas con éxito");
      setProjectId("");
      setAssignments([]);
      setCurrentEngineer("");
      setCurrentRole("");
      setErrors({});
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

      {/* Selección de proyecto */}
      <div>
        <label
          htmlFor="projectId"
          className="block font-semibold mb-1 text-blue-700"
        >
          Proyecto <span className="text-red-600">*</span>
        </label>
        <select
          id="projectId"
          name="projectId"
          value={projectId}
          onChange={(e) => {
            setProjectId(e.target.value);
            setErrors((prev) => ({ ...prev, projectId: null }));
          }}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.projectId
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          disabled={loading}
          required
        >
          <option value="">Selecciona un proyecto</option>
          {projects.map((project) => {
            const isAssigned = projectsWithAssignments.includes(
              String(project.id)
            );
            return (
              <option key={project.id} value={project.id} disabled={isAssigned}>
                {project.name} {isAssigned ? "(Ya asignado)" : ""}
              </option>
            );
          })}
        </select>
        {errors.projectId && (
          <span className="text-xs text-red-600">{errors.projectId}</span>
        )}
      </div>

      {/* Selección de ingeniero */}
      <div>
        <label
          htmlFor="currentEngineer"
          className="block font-semibold mb-1 text-blue-700"
        >
          Ingeniero <span className="text-red-600">*</span>
        </label>
        <select
          id="currentEngineer"
          name="currentEngineer"
          value={currentEngineer}
          onChange={(e) => {
            setCurrentEngineer(e.target.value);
            setErrors((prev) => ({ ...prev, currentEngineer: null }));
          }}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.currentEngineer
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          disabled={loading || !projectId}
        >
          <option value="">Selecciona un ingeniero</option>
          {engineers.map((engineer) => (
            <option key={engineer.id} value={engineer.id}>
              {engineer.full_name}
            </option>
          ))}
        </select>
        {errors.currentEngineer && (
          <span className="text-xs text-red-600">{errors.currentEngineer}</span>
        )}
      </div>

      {/* Selección de rol */}
      <div>
        <label
          htmlFor="currentRole"
          className="block font-semibold mb-1 text-blue-700"
        >
          Rol <span className="text-red-600">*</span>
        </label>
        <select
          id="currentRole"
          name="currentRole"
          value={currentRole}
          onChange={(e) => {
            setCurrentRole(e.target.value);
            setErrors((prev) => ({ ...prev, currentRole: null }));
          }}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.currentRole
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-blue-400"
          }`}
          disabled={loading || !projectId}
        >
          <option value="">Selecciona un rol</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {errors.currentRole && (
          <span className="text-xs text-red-600">{errors.currentRole}</span>
        )}
      </div>

      {/* Botón para agregar asignación a la lista */}
      <button
        type="button"
        onClick={addAssignment}
        disabled={loading || !projectId}
        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-md shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Agregar Ingeniero
      </button>

      {/* Lista de asignaciones acumuladas */}
      <div>
        <h3 className="font-semibold text-blue-700 mb-2">
          Ingenieros asignados:
        </h3>
        {assignments.length === 0 ? (
          <p className="text-gray-500 italic">
            No hay ingenieros asignados aún.
          </p>
        ) : (
          <ul className="space-y-2 max-h-48 overflow-auto border border-gray-300 rounded p-2 bg-white">
            {assignments.map(({ engineer_id, role }) => {
              const engineer = engineers.find(
                (e) => String(e.id) === String(engineer_id)
              );
              return (
                <li
                  key={engineer_id}
                  className="flex justify-between items-center bg-gray-50 px-3 py-1 rounded"
                >
                  <span>
                    {engineer?.full_name || "Ingeniero desconocido"} -{" "}
                    <em>{role}</em>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAssignment(engineer_id)}
                    className="text-red-600 hover:text-red-800 font-bold"
                    disabled={loading}
                    aria-label={`Eliminar asignación de ${engineer?.full_name}`}
                  >
                    &times;
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {errors.assignments && (
          <span className="text-xs text-red-600">{errors.assignments}</span>
        )}
      </div>

      {/* Botón para guardar todas las asignaciones */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold py-3 rounded-md shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Guardando..." : "Guardar Asignaciones"}
      </button>
    </form>
  );
}
