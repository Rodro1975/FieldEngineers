"use client";

import { useEffect, useState, useCallback } from "react";
import supabase from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { FaFilePdf, FaCopy } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useHeader } from "@/context/HeaderContext";

export default function EngineersReportPage() {
  const { setHeader } = useHeader();
  const [engineers, setEngineers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // ✅ Exportación PDF con datos correctos
  const exportAsPDF = useCallback(() => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.setFontSize(16);
      pdf.text("Reporte de Ingenieros", 14, 20);

      const headers = [
        "Nombre",
        "Correo",
        "Teléfono",
        "Disponible",
        "Tiene proyecto",
        "Ciudad",
      ];

      const rows = engineers.map((e) => {
        const tieneProyecto = assignments.some((a) => a.engineer_id === e.id)
          ? "✔️ Sí"
          : "❌ No";
        return [
          e.full_name || "-",
          e.email || "-",
          e.telephone || "-",
          e.available ? "✔️ Sí" : "❌ No",
          tieneProyecto,
          e.city || "-",
        ];
      });

      autoTable(pdf, {
        startY: 30,
        head: [headers],
        body: rows,
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: [255, 255, 255],
        },
        margin: { left: 14, right: 14 },
      });

      pdf.save("reporte_ingenieros.pdf");
    } catch (err) {
      toast.error("Error al generar PDF: " + err.message);
    }
  }, [engineers, assignments]);

  useEffect(() => {
    setHeader({
      title: "Reporte de Ingenieros",
      subtitle: "Visualiza y exporta información clave de los ingenieros",
      actions: [
        {
          label: "Exportar como PDF",
          onClick: exportAsPDF,
          icon: FaFilePdf,
        },
      ],
    });
  }, [setHeader, exportAsPDF]);

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
      setRowsPerPage(width < 768 ? 6 : 8);
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
        setEngineers(data);
      } catch (err) {
        toast.error("Error al cargar ingenieros: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    async function fetchAssignments() {
      const { data, error } = await supabase
        .from("assignments")
        .select("engineer_id");
      if (!error) setAssignments(data || []);
    }

    fetchData(debouncedSearch);
    fetchAssignments();
  }, [debouncedSearch]);

  const handleCopy = (e) => {
    const text = `${e.full_name} | ${e.email} | ${e.telephone}`;
    navigator.clipboard.writeText(text);
    toast.success("Contacto copiado");
  };

  const totalPages = Math.ceil(engineers.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const paginated = engineers.slice(startIdx, startIdx + rowsPerPage);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] p-4">
      <Toaster position="top-center" />

      <div className="mb-2 flex items-center gap-2 max-w-full">
        <input
          type="text"
          placeholder="Buscar por nombre o ciudad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 flex-grow min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center mt-10 text-gray-500">Cargando datos...</p>
      ) : (
        <div className="flex-1 overflow-auto border border-gray-200 rounded-md shadow-sm">
          <table className="w-full table-auto border-collapse text-sm font-sans">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-700">
                  Nombre
                </th>
                <th className="p-3 text-left font-semibold text-gray-700">
                  Correo
                </th>
                <th className="p-3 text-left font-semibold text-gray-700">
                  Teléfono
                </th>
                <th className="p-3 text-left font-semibold text-gray-700">
                  Disponible
                </th>
                <th className="p-3 text-left font-semibold text-gray-700">
                  Tiene proyecto
                </th>
                <th className="p-3 text-left font-semibold text-gray-700">
                  Ciudad
                </th>
                <th className="p-3 text-left font-semibold text-gray-700">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No se encontraron ingenieros.
                  </td>
                </tr>
              ) : (
                paginated.map((e) => (
                  <tr key={e.id} className="odd:bg-white even:bg-gray-50">
                    <td className="p-3 text-gray-800 font-semibold">
                      {e.full_name}
                    </td>
                    <td className="p-3 text-gray-700">{e.email}</td>
                    <td className="p-3 text-gray-700">{e.telephone}</td>
                    <td className="p-3 text-gray-700">
                      {e.available ? "✔️ Sí" : "❌ No"}
                    </td>
                    <td className="p-3 text-gray-700">
                      {assignments.some((a) => a.engineer_id === e.id)
                        ? "✔️ Sí"
                        : "❌ No"}
                    </td>
                    <td className="p-3 text-gray-700">{e.city || "-"}</td>
                    <td className="p-3">
                      <button
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                        onClick={() => handleCopy(e)}
                      >
                        <FaCopy /> Copiar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {engineers.length > rowsPerPage && (
        <div className="mt-4 flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
