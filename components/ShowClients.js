"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

export default function ShowClients({ refreshSignal = null }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Estados para edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
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

  // Carga clientes
  useEffect(() => {
    async function fetchClients(filter = "") {
      setLoading(true);
      try {
        let query = supabase
          .from("clients")
          .select("*")
          .order("company_name", { ascending: true });

        if (filter) {
          query = query.or(
            `company_name.ilike.%${filter}%,contact_name.ilike.%${filter}%`
          );
        }

        const { data, error } = await query;
        if (error) throw error;

        setClients(data);
      } catch (err) {
        setError(err.message);
        toast.error("Error al cargar clientes: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchClients(debouncedSearch);
  }, [debouncedSearch, refreshSignal]);

  // Manejo de búsqueda
  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleClear = () => setSearch("");

  // Confirmar y eliminar cliente
  const confirmDelete = (id) => {
    toast.custom((t) => (
      <div
        className={`bg-white border border-gray-300 shadow-md rounded-lg px-6 py-4 flex flex-col items-center gap-3 transition-all ${
          t.visible ? "animate-enter" : "animate-leave"
        }`}
      >
        <p className="text-center text-sm text-gray-700">
          ¿Estás seguro de que deseas eliminar este cliente?
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
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar: " + error.message);
    } else {
      setClients((prev) => prev.filter((client) => client.id !== id));
      toast.success("Cliente eliminado");
    }
  };

  // Abrir modal edición y cargar datos
  const openEditModal = (client) => {
    setClientToEdit(client);
    setEditForm({
      company_name: client.company_name || "",
      contact_name: client.contact_name || "",
      contact_email: client.contact_email || "",
      contact_phone: client.contact_phone || "",
      address: client.address || "",
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
    if (!editForm.company_name.trim())
      errors.company_name = "El nombre de la empresa es obligatorio";
    if (!editForm.contact_name.trim())
      errors.contact_name = "El nombre del contacto es obligatorio";
    if (!editForm.contact_email.trim()) {
      errors.contact_email = "El correo electrónico es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(editForm.contact_email)) {
      errors.contact_email = "El correo electrónico no es válido";
    }
    if (editForm.contact_phone && !/^\d+$/.test(editForm.contact_phone)) {
      errors.contact_phone = "El teléfono solo debe contener números";
    }
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
      .from("clients")
      .update({
        company_name: editForm.company_name.trim(),
        contact_name: editForm.contact_name.trim(),
        contact_email: editForm.contact_email.trim(),
        contact_phone: editForm.contact_phone.trim() || null,
        address: editForm.address.trim() || null,
      })
      .eq("id", clientToEdit.id);
    setEditLoading(false);
    if (error) {
      toast.error("Error al actualizar: " + error.message);
    } else {
      toast.success("Cliente actualizado");
      setShowEditModal(false);
      setClientToEdit(null);
      // Actualizar lista localmente
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientToEdit.id ? { ...client, ...editForm } : client
        )
      );
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setClientToEdit(null);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      <Toaster position="top-center" />

      {/* Búsqueda */}
      <div className="mb-4 flex items-center gap-2 max-w-full">
        <input
          type="text"
          placeholder="Buscar por empresa o contacto..."
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
        <p className="text-center mt-10 text-gray-500">Cargando clientes...</p>
      ) : error ? (
        <p className="text-center mt-10 text-red-600">Error: {error}</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm flex-1 min-w-0">
          <table className="w-full border-collapse table-auto">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Empresa
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Contacto
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Correo
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Teléfono
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Dirección
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Creado
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Actualizado
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">
                    No se encontraron clientes.
                  </td>
                </tr>
              ) : (
                clients.map((client, idx) => (
                  <tr
                    key={client.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-3 text-sm text-gray-900">
                      {client.company_name}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {client.contact_name || "-"}
                    </td>
                    <td className="p-3 text-sm text-gray-600 break-words">
                      {client.contact_email || "-"}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {client.contact_phone || "-"}
                    </td>
                    <td className="p-3 text-sm text-gray-600 break-words">
                      {client.address || "-"}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {client.created_at
                        ? new Date(client.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {client.updated_at
                        ? new Date(client.updated_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                        title="Editar"
                        onClick={() => openEditModal(client)}
                      >
                        <FaEdit />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                      <button
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                        title="Eliminar"
                        onClick={() => confirmDelete(client.id)}
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
              Editar Cliente
            </h3>

            <div>
              <label className="block font-semibold mb-1 text-blue-700">
                Nombre de la empresa <span className="text-red-600">*</span>
              </label>
              <input
                name="company_name"
                value={editForm.company_name}
                onChange={handleEditChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  editErrors.company_name
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-400"
                }`}
                required
              />
              {editErrors.company_name && (
                <span className="text-xs text-red-600">
                  {editErrors.company_name}
                </span>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-blue-700">
                Nombre del contacto <span className="text-red-600">*</span>
              </label>
              <input
                name="contact_name"
                value={editForm.contact_name}
                onChange={handleEditChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  editErrors.contact_name
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-400"
                }`}
                required
              />
              {editErrors.contact_name && (
                <span className="text-xs text-red-600">
                  {editErrors.contact_name}
                </span>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-blue-700">
                Correo electrónico <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="contact_email"
                value={editForm.contact_email}
                onChange={handleEditChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  editErrors.contact_email
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-400"
                }`}
                required
              />
              {editErrors.contact_email && (
                <span className="text-xs text-red-600">
                  {editErrors.contact_email}
                </span>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-blue-700">
                Teléfono
              </label>
              <input
                type="text"
                name="contact_phone"
                value={editForm.contact_phone}
                onChange={handleEditChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  editErrors.contact_phone
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-400"
                }`}
              />
              {editErrors.contact_phone && (
                <span className="text-xs text-red-600">
                  {editErrors.contact_phone}
                </span>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-blue-700">
                Dirección
              </label>
              <textarea
                name="address"
                value={editForm.address}
                onChange={handleEditChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                rows={3}
              />
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
