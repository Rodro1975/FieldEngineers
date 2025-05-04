"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

export default function MostrarIngenieros() {
  const [ingenieros, setIngenieros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from("engineers")
          .select("*")
          .order("id", { ascending: true });
        if (error) throw error;
        setIngenieros(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p className="text-center">Cargando...</p>;
  if (error) return <p className="text-center text-red-600">Error: {error}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-black">
        <thead>
          <tr>
            <th className="border-b p-2">ID</th>
            <th className="border-b p-2">Nombre</th>
            <th className="border-b p-2">Ciudad</th>
            <th className="border-b p-2">Habilidades</th>
            <th className="border-b p-2">Inglés</th>
            <th className="border-b p-2">Disponible</th>
            <th className="border-b p-2">Proyecto</th>
            <th className="border-b p-2">Correo</th>
            <th className="border-b p-2">Teléfono</th>
            <th className="border-b p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ingenieros.map((ing) => (
            <tr key={ing.id}>
              <td className="p-2">{ing.id}</td>
              <td className="p-2">{ing.full_name}</td>
              <td className="p-2">{ing.city}</td>
              <td className="p-2">{(ing.skills || []).join(", ")}</td>
              <td className="p-2">{ing.english_level}</td>
              <td className="p-2">{ing.available ? "Sí" : "No"}</td>
              <td className="p-2">{ing.proyect || "-"}</td>
              <td className="p-2">{ing.email || "-"}</td>
              <td className="p-2">{ing.telephone || "-"}</td>
              <td className="p-2 space-x-2">
                <button className="bg-black text-white px-2 py-1 rounded">
                  Editar
                </button>
                <button className="bg-red-600 text-white px-2 py-1 rounded">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
