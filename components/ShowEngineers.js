"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import {
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
} from "react-icons/fa";

export default function MostrarIngenieros({ refreshSignal = null }) {
  const [ingenieros, setIngenieros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [engineerToEdit, setEngineerToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    city: "",
    skills: "",
    english_level: "",
    email: "",
    telephone: "",
    proyect: "",
    available: false,
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

  // Carga de ingenieros
  useEffect(() => {
    async function fetchData(filter = "") {
      setLoading(true);
      try {
        let query = supabase
          .from("engineers")
          .select("*")
          .order("id", { ascending: true });

        if (filter) {
          query = query.or(
            `full_name.ilike.%${filter}%,city.ilike.%${filter}%`
          );
        }

        const { data, error } = await query;
        if (error) throw error;

        setIngenieros(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData(debouncedSearch);
  }, [debouncedSearch, refreshSignal]);

  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleClear = () => setSearch("");

  // Confirmar y eliminar ingeniero
  const confirmDelete = (id) => {
    toast.custom((t) => (
      <div
        className={`bg-white border border-gray-300 shadow-md rounded-lg px-6 py-4 flex flex-col items-center gap-3 transition-all ${
          t.visible ? "animate-enter" : "animate-leave"
        }`}
      >
        <p className="text-center text-sm text-gray-700">
          ¿Estás seguro de que deseas eliminar este ingeniero?
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
    const { error } = await supabase.from("engineers").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar: " + error.message);
    } else {
      setIngenieros((prev) => prev.filter((ing) => ing.id !== id));
      toast.success("Ingeniero eliminado");
    }
  };

  // Abrir modal edición y cargar datos
  const openEditModal = (engineer) => {
    setEngineerToEdit(engineer);
    setEditForm({
      full_name: engineer.full_name || "",
      city: engineer.city || "",
      skills: (engineer.skills || []).join(", "),
      english_level: engineer.english_level || "",
      email: engineer.email || "",
      telephone: engineer.telephone || "",
      proyect: engineer.proyect || "",
      available: engineer.available || false,
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  // Manejar cambios en formulario edición
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setEditErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Validar formulario edición
  const validateEditForm = () => {
    const errors = {};
    if (!editForm.full_name.trim())
      errors.full_name = "El nombre es obligatorio";
    if (!editForm.city.trim()) errors.city = "La ciudad es obligatoria";
    if (!editForm.skills.trim())
      errors.skills = "Las habilidades son obligatorias";
    if (!editForm.english_level)
      errors.english_level = "Selecciona un nivel de inglés";
    if (!editForm.email.trim()) errors.email = "El correo es obligatorio";
    if (!editForm.telephone.trim())
      errors.telephone = "El teléfono es obligatorio";
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
      .from("engineers")
      .update({
        full_name: editForm.full_name.trim(),
        city: editForm.city.trim(),
        skills: editForm.skills.split(",").map((s) => s.trim()),
        english_level: editForm.english_level,
        email: editForm.email.trim(),
        telephone: editForm.telephone.trim(),
        proyect: editForm.proyect.trim() || null,
        available: editForm.available,
      })
      .eq("id", engineerToEdit.id);
    setEditLoading(false);
    if (error) {
      toast.error("Error al actualizar: " + error.message);
    } else {
      toast.success("Ingeniero actualizado");
      setShowEditModal(false);
      setEngineerToEdit(null);
      // Actualizar lista localmente o disparar refresh desde padre
      setIngenieros((prev) =>
        prev.map((ing) =>
          ing.id === engineerToEdit.id
            ? {
                ...ing,
                ...editForm,
                skills: editForm.skills.split(",").map((s) => s.trim()),
              }
            : ing
        )
      );
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEngineerToEdit(null);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      <Toaster position="top-center" />

      {/* Búsqueda */}
      <div className="mb-2 flex items-center gap-2 max-w-full">
        <input
          type="text"
          placeholder="Buscar por nombre o ciudad..."
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

      {search && (
        <p className="mb-2 text-sm text-gray-600 italic">
          Mostrando resultados filtrados. Para ver la lista completa, presiona{" "}
          <strong>Limpiar</strong>.
        </p>
      )}

      {loading ? (
        <p className="text-center mt-10 text-gray-500">
          Cargando ingenieros...
        </p>
      ) : error ? (
        <p className="text-center mt-10 text-red-600">Error: {error}</p>
      ) : (
        <div className="flex-1 overflow-auto border border-gray-200 rounded-md shadow-sm">
          <div className="min-w-full overflow-x-auto">
            <table className="w-full border-collapse table-auto">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  {[
                    "ID",
                    "Nombre",
                    "Ciudad",
                    "Habilidades",
                    "Inglés",
                    "Disponible",
                    "Proyecto",
                    "Correo",
                    "Teléfono",
                    "Acciones",
                  ].map((header, index) => (
                    <th
                      key={header}
                      className={`text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300 ${
                        index < 2
                          ? "bg-gray-100 sticky left-0 z-20 border-r border-gray-300"
                          : ""
                      }`}
                      style={
                        index === 0
                          ? { minWidth: "60px", width: "60px", left: 0 }
                          : index === 1
                          ? { minWidth: "150px", width: "150px", left: "60px" }
                          : {}
                      }
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {ingenieros.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-4 text-center text-gray-500">
                      No se encontraron ingenieros.
                    </td>
                  </tr>
                ) : (
                  ingenieros.map((ing, idx) => {
                    const bgColor = idx % 2 === 0 ? "white" : "#f9fafb";

                    return (
                      <tr
                        key={ing.id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td
                          className="p-3 text-sm text-gray-600 sticky left-0 border-r border-gray-300 z-10"
                          style={{
                            minWidth: "60px",
                            width: "60px",
                            backgroundColor: bgColor,
                          }}
                        >
                          {ing.id}
                        </td>
                        <td
                          className="p-3 text-sm font-medium text-gray-900 sticky left-[60px] border-r border-gray-300 z-10"
                          style={{
                            minWidth: "150px",
                            width: "150px",
                            backgroundColor: bgColor,
                          }}
                        >
                          {ing.full_name}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {ing.city}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {(ing.skills || []).join(", ")}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {ing.english_level}
                        </td>
                        <td className="p-3 text-center">
                          {ing.available ? (
                            <FaCheckCircle
                              className="text-green-500 mx-auto"
                              title="Disponible"
                            />
                          ) : (
                            <FaTimesCircle
                              className="text-red-500 mx-auto"
                              title="No disponible"
                            />
                          )}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {ing.proyect || "-"}
                        </td>
                        <td className="p-3 text-sm text-gray-600 break-words">
                          {ing.email || "-"}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {ing.telephone || "-"}
                        </td>
                        <td className="p-3 flex gap-2">
                          <button
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                            title="Editar"
                            onClick={() => openEditModal(ing)}
                          >
                            <FaEdit />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                          <button
                            onClick={() => confirmDelete(ing.id)}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                            title="Eliminar"
                          >
                            <FaTrash />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
              Editar Ingeniero
            </h3>

            <div>
              <label className="block font-semibold mb-1 text-blue-700">
                Nombre completo <span className="text-red-600">*</span>
              </label>
              <input
                name="full_name"
                value={editForm.full_name}
                onChange={handleEditChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  editErrors.full_name
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-400"
                }`}
                required
              />
              {editErrors.full_name && (
                <span className="text-xs text-red-600">
                  {editErrors.full_name}
                </span>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-blue-700">
                Ciudad <span className="text-red-600">*</span>
              </label>
              <input
                name="city"
                value={editForm.city}
                onChange={handleEditChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  editErrors.city
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-400"
                }`}
                required
              />
              {editErrors.city && (
                <span className="text-xs text-red-600">{editErrors.city}</span>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-blue-700">
                Habilidades (separadas por coma){" "}
                <span className="text-red-600">*</span>
              </label>
              <input
                name="skills"
                value={editForm.skills}
                onChange={handleEditChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  editErrors.skills
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-400"
                }`}
                required
              />
              {editErrors.skills && (
                <span className="text-xs text-red-600">
                  {editErrors.skills}
                </span>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-blue-700">
                Nivel de inglés <span className="text-red-600">*</span>
              </label>
              <select
                name="english_level"
                value={editForm.english_level}
                onChange={handleEditChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  editErrors.english_level
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-400"
                }`}
                required
              >
                <option value="">Selecciona nivel</option>
                <option value="básico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
                <option value="nativo">Nativo</option>
              </select>
              {editErrors.english_level && (
                <span className="text-xs text-red-600">
                  {editErrors.english_level}
                </span>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-blue-700">
                Correo electrónico <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  editErrors.email
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-400"
                }`}
                required
              />
              {editErrors.email && (
                <span className="text-xs text-red-600">{editErrors.email}</span>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-blue-700">
                Teléfono <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="telephone"
                inputMode="numeric"
                maxLength={10}
                value={editForm.telephone}
                onChange={handleEditChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  editErrors.telephone
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-400"
                }`}
                required
              />
              {editErrors.telephone && (
                <span className="text-xs text-red-600">
                  {editErrors.telephone}
                </span>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-blue-700">
                Proyecto asignado
              </label>
              <input
                name="proyect"
                value={editForm.proyect}
                onChange={handleEditChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="available"
                name="available"
                type="checkbox"
                checked={editForm.available}
                onChange={handleEditChange}
                className="border border-gray-300 accent-blue-600"
              />
              <label
                htmlFor="available"
                className="font-semibold text-blue-700"
              >
                Disponible para asignación
              </label>
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
