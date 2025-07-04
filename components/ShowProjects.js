"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";

// Modal de edición simple
function EditProjectModal({ project, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: project.name || "",
    description: project.description || "",
    start_date: project.start_date || "",
    end_date: project.end_date || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("projects")
      .update({
        name: form.name.trim(),
        description: form.description.trim() || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      })
      .eq("id", project.id);
    setLoading(false);
    if (error) {
      toast.error("Error al actualizar: " + error.message);
    } else {
      toast.success("Proyecto actualizado");
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        onSubmit={handleUpdate}
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-md space-y-4"
      >
        <h3 className="text-xl font-bold text-blue-700 mb-2">
          Editar Proyecto
        </h3>
        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Nombre
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-700">
            Descripción
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1 text-blue-700">
              Fecha inicio
            </label>
            <input
              name="start_date"
              type="date"
              value={form.start_date || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-700">
              Fecha fin
            </label>
            <input
              name="end_date"
              type="date"
              value={form.end_date || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-4">
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
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

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

  // Opcional: suscripción realtime
  useEffect(() => {
    const subscription = supabase
      .channel("public:projects")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          // Refrescar datos al recibir cambios
          setLoading(true);
          supabase
            .from("projects")
            .select("*")
            .order("start_date", { ascending: true })
            .then(({ data, error }) => {
              if (error) {
                setError(error.message);
              } else {
                setProjects(data);
              }
              setLoading(false);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

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
                        onClick={() => {
                          setProjectToEdit(project);
                          setShowEditModal(true);
                        }}
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

      {/* Modal de edición */}
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
