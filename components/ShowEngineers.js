// components/ShowEngineers.js
"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function MostrarIngenieros() {
  const [ingenieros, setIngenieros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce de búsqueda (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Obtener ingenieros desde Supabase
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

        // Solo actualiza si hay cambios
        if (JSON.stringify(data) !== JSON.stringify(ingenieros)) {
          setIngenieros(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleClear = () => setSearch("");

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
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
        <div className="overflow-auto border border-gray-200 rounded-md shadow-sm flex-1 min-w-0">
          <table className="w-full border-collapse min-w-[900px]">
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
                ].map((header) => (
                  <th
                    key={header}
                    className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300"
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
                ingenieros.map((ing, idx) => (
                  <tr
                    key={ing.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-3 text-sm text-gray-600">{ing.id}</td>
                    <td className="p-3 text-sm font-medium text-gray-900">
                      {ing.full_name}
                    </td>
                    <td className="p-3 text-sm text-gray-600">{ing.city}</td>
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
                    <td className="p-3 flex  gap-2">
                      <button
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                        title="Editar"
                      >
                        <FaEdit />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                      <button
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
    </div>
  );
}
