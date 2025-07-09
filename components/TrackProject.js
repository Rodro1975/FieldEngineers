"use client";

import { useState, useEffect, useCallback } from "react";
import supabase from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function TrackProject({ onClose }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTrackingHistory = useCallback(async () => {
    if (!selectedProject) return;

    const { data, error } = await supabase
      .from("project_tracking")
      .select("*, profiles(full_name)")
      .eq("project_id", selectedProject)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar historial");
    } else {
      setHistory(data);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar proyectos");
    } else {
      setProjects(data);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTrackingHistory();
    }
  }, [selectedProject, fetchTrackingHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status.trim() || !selectedProject) {
      return toast.error("Selecciona un proyecto y estado");
    }

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("project_tracking").insert({
      project_id: selectedProject,
      status,
      notes,
      created_by: user.id,
    });

    setLoading(false);

    if (error) {
      toast.error("Error al registrar seguimiento");
    } else {
      toast.success("Seguimiento registrado");
      setStatus("");
      setNotes("");
      fetchTrackingHistory();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
      <h2 className="text-xl font-bold text-blue-800 mb-4">
        Seguimiento del Proyecto
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="font-semibold text-blue-700 block mb-1">
            Proyecto
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">Selecciona un proyecto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold text-blue-700 block mb-1">
            Estado del proyecto
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">Selecciona un estado</option>
            <option value="propuesta">Propuesta</option>
            <option value="cotizacion enviada">Cotización enviada</option>
            <option value="en ejecución">En ejecución</option>
            <option value="en pausa">En pausa</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-blue-700 block mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={3}
          ></textarea>
        </div>

        <div className="flex justify-end gap-3 mt-4">
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
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold py-2 px-6 rounded-md shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

      <h3 className="font-semibold text-blue-800 mb-2">Historial</h3>
      <ul className="space-y-3 max-h-64 overflow-auto border-t pt-2">
        {history.length === 0 ? (
          <p className="text-sm text-gray-600">Sin registros aún.</p>
        ) : (
          history.map((entry) => (
            <li key={entry.id} className="border-b pb-2 text-sm text-gray-700">
              <p className="font-medium text-blue-700">{entry.status}</p>
              <p>{entry.notes || "Sin notas"}</p>
              <p className="text-xs text-gray-500">
                {new Date(entry.created_at).toLocaleString()} –{" "}
                {entry.profiles?.full_name || "Usuario desconocido"}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
