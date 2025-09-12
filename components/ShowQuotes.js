"use client";

import { useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { Toaster } from "react-hot-toast";
import { FaSearch, FaExternalLinkAlt } from "react-icons/fa";

const FIRST_COL_W = 120; // px para Folio (columna sticky 1)
const SECOND_COL_W = 220; // px para Cliente (columna sticky 2)
const ROWS_PER_PAGE = 10;

export default function ShowQuotes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);

  const [clientsMap, setClientsMap] = useState({});
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Construye filtro OR para Supabase (folio, concept, notes, description)
  const orFilter = useMemo(() => {
    if (!search.trim()) return "";
    const term = search.trim().replace(/[%_]/g, (m) => `\\${m}`);
    return `folio.ilike.%${term}%,concept.ilike.%${term}%,notes.ilike.%${term}%,description.ilike.%${term}%`;
  }, [search]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // Base query
        let q = supabase
          .from("quotes")
          .select(
            "id,user_id,client_id,folio,concept,amount,currency,validity,notes,pdf_url,created_at,country,description",
            { count: "exact" }
          )
          .order("created_at", { ascending: false });

        if (orFilter) q = q.or(orFilter);

        // paginación (1-based UI)
        const from = (currentPage - 1) * ROWS_PER_PAGE;
        const to = from + ROWS_PER_PAGE - 1;

        const { data, count: total, error: err } = await q.range(from, to);
        if (err) throw err;

        if (!isMounted) return;
        setRows(data || []);
        setCount(total || 0);

        // Resuelve nombres de clientes
        const cids = Array.from(
          new Set((data || []).map((r) => r.client_id).filter(Boolean))
        );
        if (cids.length) {
          const { data: clients, error: cErr } = await supabase
            .from("clients")
            .select("id, contact_name, company_name")
            .in("id", cids);
          if (!cErr && clients) {
            const map = {};
            for (const c of clients) {
              const label = [c.contact_name, c.company_name]
                .filter(Boolean)
                .join(" – ");
              map[c.id] = label || "—";
            }
            if (isMounted) setClientsMap(map);
          }
        } else {
          setClientsMap({});
        }
      } catch (e) {
        console.error(e);
        isMounted && setError("No se pudieron cargar las cotizaciones.");
      } finally {
        isMounted && setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [orFilter, currentPage]);

  const totalPages = Math.max(1, Math.ceil(count / ROWS_PER_PAGE));

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setSearch("");
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      <Toaster position="top-center" />

      {/* Buscador + limpiar */}
      <div className="mb-2 flex items-center gap-2 max-w-full">
        <div className="relative flex-grow min-w-0">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por folio, concepto, notas o descripción..."
            value={search}
            onChange={handleSearchChange}
            className="border border-gray-300 rounded pl-9 pr-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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

      {/* Estados */}
      {loading ? (
        <p className="text-center mt-10 text-gray-500">
          Cargando cotizaciones...
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
                    "Folio",
                    "Cliente",
                    "Concepto",
                    "Monto",
                    "Moneda",
                    "País",
                    "Fecha",
                    "PDF",
                  ].map((header, index) => (
                    <th
                      key={header}
                      className={`text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300 ${
                        index === 0 || index === 1
                          ? "bg-gray-100 sticky z-20 border-r border-gray-300"
                          : ""
                      }`}
                      style={
                        index === 0
                          ? {
                              minWidth: `${FIRST_COL_W}px`,
                              width: `${FIRST_COL_W}px`,
                              left: 0,
                            }
                          : index === 1
                          ? {
                              minWidth: `${SECOND_COL_W}px`,
                              width: `${SECOND_COL_W}px`,
                              left: `${FIRST_COL_W}px`,
                            }
                          : {}
                      }
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-gray-500">
                      No se encontraron cotizaciones.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => {
                    const zebra = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
                    const bgColor = idx % 2 === 0 ? "#ffffff" : "#f9fafb";

                    return (
                      <tr key={r.id} className={zebra}>
                        {/* Folio (sticky) */}
                        <td
                          className="p-3 text-sm font-medium text-blue-900 sticky left-0 border-r border-gray-300 z-10"
                          style={{
                            minWidth: `${FIRST_COL_W}px`,
                            width: `${FIRST_COL_W}px`,
                            backgroundColor: bgColor,
                          }}
                          title={r.folio || ""}
                        >
                          {r.folio || "—"}
                        </td>

                        {/* Cliente (sticky) */}
                        <td
                          className="p-3 text-sm text-gray-900 sticky border-r border-gray-300 z-10"
                          style={{
                            minWidth: `${SECOND_COL_W}px`,
                            width: `${SECOND_COL_W}px`,
                            left: `${FIRST_COL_W}px`,
                            backgroundColor: bgColor,
                          }}
                          title={clientsMap[r.client_id] || ""}
                        >
                          {clientsMap[r.client_id] || "—"}
                        </td>

                        {/* Concepto */}
                        <td className="p-3 text-sm text-gray-700">
                          <div
                            className="max-w-[28rem] truncate"
                            title={r.concept || ""}
                          >
                            {r.concept || "—"}
                          </div>
                        </td>

                        {/* Monto */}
                        <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                          {Number(r.amount || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* Moneda */}
                        <td className="p-3 text-sm text-gray-700">
                          {r.currency || "—"}
                        </td>

                        {/* País */}
                        <td className="p-3 text-sm text-gray-700">
                          {r.country || "—"}
                        </td>

                        {/* Fecha */}
                        <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                          {r.created_at
                            ? new Date(r.created_at).toLocaleString("es-MX")
                            : "—"}
                        </td>

                        {/* PDF */}
                        <td className="p-3 text-sm">
                          {r.pdf_url ? (
                            <a
                              href={r.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                              title="Abrir PDF"
                            >
                              Ver <FaExternalLinkAlt className="inline-block" />
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
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
      {count > ROWS_PER_PAGE && (
        <div className="mt-4 flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {count === 0 ? 0 : currentPage} de {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
