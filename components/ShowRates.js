"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { Toaster, toast } from "react-hot-toast";
import RateCard from "@/components/RateCard";

export default function ShowRates({ refreshSignal = null }) {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false); // Mostrar tarifas vencidas

  useEffect(() => {
    fetchRates();
  }, [refreshSignal]);

  const fetchRates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("client_rates")
      .select("*, clients(company_name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar tarifas");
    } else {
      setRates(data);
    }
    setLoading(false);
  };

  const filteredRates = rates.filter((rate) => {
    const query = search.toLowerCase();
    const matchText =
      rate.clients?.company_name?.toLowerCase().includes(query) ||
      rate.notes?.toLowerCase().includes(query);
    const matchVigente = showAll ? true : rate.vigente === true;
    return matchText && matchVigente;
  });

  const handleClear = () => setSearch("");

  return (
    <div className="p-4 bg-white rounded shadow-md space-y-6">
      <Toaster position="top-center" />

      {/* Tarjeta de tarifas propias */}
      <RateCard />

      {/* Búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="text"
          placeholder="Buscar por empresa o notas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setShowAll(!showAll)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition text-sm"
        >
          {showAll ? "Ocultar vencidas" : "Ver todas"}
        </button>
        {search && (
          <button
            onClick={handleClear}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition text-sm"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla de tarifas */}
      <div>
        <h2 className="text-lg font-bold text-blue-800 mb-4">
          Tarifas Registradas por Cliente
        </h2>

        {loading ? (
          <p className="text-gray-500">Cargando tarifas...</p>
        ) : filteredRates.length === 0 ? (
          <p className="text-gray-500">No hay tarifas registradas.</p>
        ) : (
          <table className="w-full table-auto border border-gray-200 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left text-sm font-semibold text-gray-700">
                  Cliente
                </th>
                <th className="p-2 text-left text-sm font-semibold text-gray-700">
                  Por hora
                </th>
                <th className="p-2 text-left text-sm font-semibold text-gray-700">
                  Media jornada
                </th>
                <th className="p-2 text-left text-sm font-semibold text-gray-700">
                  Jornada completa
                </th>
                <th className="p-2 text-left text-sm font-semibold text-gray-700">
                  Hora extra
                </th>
                <th className="p-2 text-left text-sm font-semibold text-gray-700">
                  Estado
                </th>
                <th className="p-2 text-left text-sm font-semibold text-gray-700">
                  Notas
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRates.map((rate, idx) => (
                <tr
                  key={rate.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-2 text-sm text-gray-800">
                    {rate.clients?.company_name || "-"}
                  </td>
                  <td className="p-2 text-sm text-gray-700">
                    ${rate.hourly_rate?.toFixed(2) || "0.00"}
                  </td>
                  <td className="p-2 text-sm text-gray-700">
                    ${rate.half_day_rate?.toFixed(2) || "0.00"}
                  </td>
                  <td className="p-2 text-sm text-gray-700">
                    ${rate.full_day_rate?.toFixed(2) || "0.00"}
                  </td>
                  <td className="p-2 text-sm text-gray-700">
                    ${rate.extra_hour_rate?.toFixed(2) || "0.00"}
                  </td>
                  <td className="p-2 text-sm">
                    {rate.vigente ? (
                      <span className="text-green-600 font-semibold">
                        Vigente
                      </span>
                    ) : (
                      <span className="text-red-500 text-sm italic">
                        Vencida ({rate.fecha_fin})
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-sm text-gray-600">
                    {rate.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
