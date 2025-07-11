"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditAssignments from "@/components/EditAssigments";

export default function ShowAssignments({ refreshSignal = null }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState(null);

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

        const { data, error } = await query;
        if (error) throw error;

        const filtered = filter
          ? data.filter((item) => {
              const project = item.projects?.name?.toLowerCase() || "";
              const engineer = item.engineers?.full_name?.toLowerCase() || "";
              return (
                project.includes(filter.toLowerCase()) ||
                engineer.includes(filter.toLowerCase())
              );
            })
          : data;

        setAssignments(filtered);
      } catch (err) {
        setError(err.message);
        toast.error("Error al cargar asignaciones: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments(debouncedSearch);
  }, [debouncedSearch, refreshSignal]);

  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleClear = () => setSearch("");

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

  const openEditModal = (assignment) => {
    setAssignmentToEdit(assignment);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setAssignmentToEdit(null);
  };

  const handleSuccess = () => {
    setShowEditModal(false);
    setAssignmentToEdit(null);
    // Opcional: refrescar lista
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

      {showEditModal && assignmentToEdit && (
        <EditAssignments
          assignment={assignmentToEdit}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
