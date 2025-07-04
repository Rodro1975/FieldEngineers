"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditProjectModal from "./EditProjects";

export default function ShowProjects({ refreshSignal = null }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  // Debounce para búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch proyectos
  useEffect(() => {
    async function fetchProjects(filter = "") {
      setLoading(true);
      try {
        let query = supabase
          .from("projects")
          .select("*")
          .order("start_date", { ascending: true });

        if (filter) {
          query = query.ilike("name", `%${filter}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects(debouncedSearch);
  }, [debouncedSearch, refreshSignal]);

  // Manejo para borrar proyectos
  const confirmDelete = (id) => {
    toast.custom((t) => (
      <div
        className={`bg-white border border-gray-300 shadow-md rounded-lg px-6 py-4 flex flex-col items-center gap-3 transition-all ${
          t.visible ? "animate-enter" : "animate-leave"
        }`}
      >
        <p className="text-center text-sm text-gray-700">
          ¿Estás seguro de que deseas eliminar este proyecto?
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              handleDelete(id);
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

  const handleDelete = async (id) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar: " + error.message);
    } else {
      setProjects((prev) => prev.filter((proj) => proj.id !== id));
      toast.success("Proyecto eliminado");
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setProjectToEdit(null);
  };

  const handleEditClick = (project) => {
    setProjectToEdit(project);
    setShowEditModal(true);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      <Toaster position="top-center" />

      {/* Búsqueda */}
      <div className="mb-2 flex items-center gap-2 max-w-full">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 flex-grow min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded flex-shrink-0 transition"
          >
            Limpiar
          </button>
        )}
      </div>

      {search && (
        <p className="mb-2 text-sm text-gray-600 italic">
          Mostrando resultados filtrados. Para ver la lista completa, presiona{" "}
          <strong>Limpiar</strong>.
        </p>
      )}

      {loading ? (
        <p className="text-center mt-10 text-gray-500">Cargando proyectos...</p>
      ) : error ? (
        <p className="text-center mt-10 text-red-600">Error: {error}</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm flex-1 min-w-0">
          <table className="w-full border-collapse table-auto">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  ID
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Nombre
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Descripción
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Fecha Inicio
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Fecha Fin
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    No se encontraron proyectos.
                  </td>
                </tr>
              ) : (
                projects.map((project, idx) => (
                  <tr
                    key={project.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-3 text-sm text-gray-600">{project.id}</td>
                    <td className="p-3 text-sm font-medium text-gray-900">
                      {project.name}
                    </td>
                    <td className="p-3 text-sm text-gray-600 break-words">
                      {project.description || "-"}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {project.start_date
                        ? new Date(project.start_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {project.end_date
                        ? new Date(project.end_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                        title="Editar"
                        onClick={() => handleEditClick(project)}
                      >
                        <FaEdit />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                      <button
                        onClick={() => confirmDelete(project.id)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                        title="Eliminar"
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

      {showEditModal && projectToEdit && (
        <EditProjectModal
          project={projectToEdit}
          onClose={handleCloseModal}
          onSuccess={handleCloseModal}
        />
      )}
    </div>
  );
}
