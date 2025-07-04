"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditClients from "@/components/EditClients";

export default function ShowClients({ refreshSignal = null }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);

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

  // Abrir modal edición
  const openEditModal = (client) => {
    setClientToEdit(client);
    setShowEditModal(true);
  };

  // Cerrar modal edición
  const handleCloseModal = () => {
    setShowEditModal(false);
    setClientToEdit(null);
  };

  // Actualizar lista localmente después de editar
  const handleSuccess = () => {
    setShowEditModal(false);
    setClientToEdit(null);
    // Opcional: refrescar lista o usar refreshSignal
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
      {showEditModal && clientToEdit && (
        <EditClients
          client={clientToEdit}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
