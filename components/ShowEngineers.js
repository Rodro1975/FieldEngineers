"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import EditEngineer from "./EditEngineer";

export default function MostrarIngenieros({ refreshSignal = null }) {
  const [ingenieros, setIngenieros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [engineerToEdit, setEngineerToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const updateRowsPerPage = () => {
      const width = window.innerWidth;
      if (width < 768) setRowsPerPage(6);
      else setRowsPerPage(5);
    };
    updateRowsPerPage();
    window.addEventListener("resize", updateRowsPerPage);
    return () => window.removeEventListener("resize", updateRowsPerPage);
  }, []);

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

  const openEditModal = (engineer) => {
    setEngineerToEdit(engineer);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEngineerToEdit(null);
  };

  const handleSuccess = () => {
    setShowEditModal(false);
    setEngineerToEdit(null);
  };

  const totalPages = Math.ceil(ingenieros.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const paginatedIngenieros = ingenieros.slice(
    startIdx,
    startIdx + rowsPerPage
  );

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      <Toaster position="top-center" />

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
                {paginatedIngenieros.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-4 text-center text-gray-500">
                      No se encontraron ingenieros.
                    </td>
                  </tr>
                ) : (
                  paginatedIngenieros.map((ing, idx) => {
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
                            onClick={() => openEditModal(ing)}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                            title="Editar"
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

      {/* Paginación */}
      {ingenieros.length > rowsPerPage && (
        <div className="mt-4 flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de edición */}
      {showEditModal && engineerToEdit && (
        <EditEngineer
          engineer={engineerToEdit}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
