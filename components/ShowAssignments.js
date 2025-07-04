"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

export default function ShowAssignments({ refreshSignal = null }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Estados para edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    project_id: "",
    engineer_id: "",
    role: "",
  });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Debounce para búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Carga asignaciones
  useEffect(() => {
    async function fetchAssignments(filter = "") {
      setLoading(true);
      try {
        let query = supabase
          .from("assignments")
          .select(
            `
            project_id,
            engineer_id,
            assigned_at,
            role,
            projects(name),
            engineers(full_name)
          `
          )
          .order("assigned_at", { ascending: false });

        if (filter) {
          query = query.or(
            `projects.name.ilike.%${filter}%,engineers.full_name.ilike.%${filter}%`
          );
        }

        const { data, error } = await query;
        if (error) throw error;

        setAssignments(data);
      } catch (err) {
        setError(err.message);
        toast.error("Error al cargar asignaciones: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments(debouncedSearch);
  }, [debouncedSearch, refreshSignal]);

  // Manejo de búsqueda
  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleClear = () => setSearch("");

  // Confirmar y eliminar asignación
  const confirmDelete = (project_id, engineer_id) => {
    toast.custom((t) => (
      <div
        className={`bg-white border border-gray-300 shadow-md rounded-lg px-6 py-4 flex flex-col items-center gap-3 transition-all ${
          t.visible ? "animate-enter" : "animate-leave"
        }`}
      >
        <p className="text-center text-sm text-gray-700">
          ¿Estás seguro de que deseas eliminar esta asignación?
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              handleDelete(project_id, engineer_id);
              toast.dismiss(t.id);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
          >
            Sí, eliminar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    ));
  };

  const handleDelete = async (project_id, engineer_id) => {
    const { error } = await supabase
      .from("assignments")
      .delete()
      .match({ project_id, engineer_id });
    if (error) {
      toast.error("Error al eliminar: " + error.message);
    } else {
      setAssignments((prev) =>
        prev.filter(
          (a) => !(a.project_id === project_id && a.engineer_id === engineer_id)
        )
      );
      toast.success("Asignación eliminada");
    }
  };

  // Abrir modal edición y cargar datos
  const openEditModal = (assignment) => {
    setAssignmentToEdit(assignment);
    setEditForm({
      project_id: assignment.project_id || "",
      engineer_id: assignment.engineer_id || "",
      role: assignment.role || "",
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  // Manejar cambios en formulario edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Validar formulario edición
  const validateEditForm = () => {
    const errors = {};
    if (!editForm.project_id) errors.project_id = "Selecciona un proyecto";
    if (!editForm.engineer_id) errors.engineer_id = "Selecciona un ingeniero";
    if (!editForm.role.trim()) errors.role = "El rol es obligatorio";
    return errors;
  };

  // Guardar cambios edición
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditLoading(true);
    const { error } = await supabase
      .from("assignments")
      .update({
        project_id: editForm.project_id,
        engineer_id: editForm.engineer_id,
        role: editForm.role.trim(),
        assigned_at: new Date().toISOString(),
      })
      .match({
        project_id: assignmentToEdit.project_id,
        engineer_id: assignmentToEdit.engineer_id,
      });
    setEditLoading(false);
    if (error) {
      toast.error("Error al actualizar: " + error.message);
    } else {
      toast.success("Asignación actualizada");
      setShowEditModal(false);
      setAssignmentToEdit(null);
      // Actualizar lista localmente
      setAssignments((prev) =>
        prev.map((a) =>
          a.project_id === assignmentToEdit.project_id &&
          a.engineer_id === assignmentToEdit.engineer_id
            ? { ...a, ...editForm, assigned_at: new Date().toISOString() }
            : a
        )
      );
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setAssignmentToEdit(null);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      <Toaster position="top-center" />

      {/* Búsqueda */}
      <div className="mb-2 flex items-center gap-2 max-w-full">
        <input
          type="text"
          placeholder="Buscar por proyecto o ingeniero..."
          value={search}
          onChange={handleSearchChange}
          className="border border-gray-300 rounded px-3 py-2 flex-grow min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {search && (
          <button
            onClick={handleClear}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded flex-shrink-0 transition"
          >
            Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center mt-10 text-gray-500">
          Cargando asignaciones...
        </p>
      ) : error ? (
        <p className="text-center mt-10 text-red-600">Error: {error}</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm flex-1 min-w-0">
          <table className="w-full border-collapse table-auto">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Proyecto
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Ingeniero
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Rol
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Fecha de asignación
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No se encontraron asignaciones.
                  </td>
                </tr>
              ) : (
                assignments.map((assignment, idx) => (
                  <tr
                    key={`${assignment.project_id}-${assignment.engineer_id}`}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-3 text-sm text-gray-900">
                      {assignment.projects?.name || "-"}
                    </td>
                    <td className="p-3 text-sm text-gray-900">
                      {assignment.engineers?.full_name || "-"}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {assignment.role || "-"}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {assignment.assigned_at
                        ? new Date(assignment.assigned_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                        title="Editar"
                        onClick={() => openEditModal(assignment)}
                      >
                        <FaEdit />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                      <button
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                        title="Eliminar"
                        onClick={() =>
                          confirmDelete(
                            assignment.project_id,
                            assignment.engineer_id
                          )
                        }
                      >
                        <FaTrash />
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white rounded-xl p-6 w-full max-w-lg shadow-md space-y-4 relative"
          >
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="Cerrar modal"
            >
              <FaTimes size={20} />
            </button>
            <h3 className="text-xl font-bold text-blue-700 mb-2">
              Editar Asignación
            </h3>

            <div>
              <label className="block font-semibold mb-1 text-blue-700">
                Proyecto <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={assignmentToEdit.projects?.name || ""}
                disabled
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-blue-700">
                Ingeniero <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={assignmentToEdit.engineers?.full_name || ""}
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
                value={editForm.role}
                onChange={handleEditChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  editErrors.role
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-400"
                }`}
                required
              />
              {editErrors.role && (
                <span className="text-xs text-red-600">{editErrors.role}</span>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                disabled={editLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold py-2 px-6 rounded-md shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
