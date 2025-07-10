"use client";

import { useState, useEffect, useCallback } from "react";
import supabase from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function TrackProject({
  projectId: propProjectId = null,
  onClose,
}) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(
    propProjectId || ""
  );
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar lista de proyectos (solo si no hay projectId desde props)
  useEffect(() => {
    if (!propProjectId) {
      supabase
        .from("projects")
        .select("id, name")
        .order("name", { ascending: true })
        .then(({ data, error }) => {
          if (error) toast.error("Error al cargar proyectos");
          else setProjects(data);
        });
    }
  }, [propProjectId]);

  // Función para cargar historial
  const fetchTrackingHistory = useCallback(async () => {
    if (!selectedProjectId) return;
    const { data, error } = await supabase
      .from("project_tracking")
      .select("*, profiles(full_name)")
      .eq("project_id", selectedProjectId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar historial");
    } else {
      setHistory(data);
    }
  }, [selectedProjectId]);

  // Cargar historial cuando cambia proyecto
  useEffect(() => {
    if (selectedProjectId) fetchTrackingHistory();
  }, [selectedProjectId, fetchTrackingHistory]);

  // Enviar seguimiento
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return toast.error("Selecciona un proyecto");
    if (!status.trim()) return toast.error("Selecciona un estado");

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Insertar en historial
    const { error: trackingError } = await supabase
      .from("project_tracking")
      .insert({
        project_id: selectedProjectId,
        status,
        notes,
        created_by: user.id,
      });

    // Actualizar estado en projects
    const { error: updateError } = await supabase
      .from("projects")
      .update({ status })
      .eq("id", selectedProjectId);

    setLoading(false);

    if (trackingError || updateError) {
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
        {!propProjectId && (
          <div>
            <label className="font-semibold text-blue-700 block mb-1">
              Proyecto
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Selecciona un proyecto</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>
        )}

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
            <option value="cotización enviada">Cotización enviada</option>
            <option value="cotización aprobada">Cotización aprobada</option>
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
              <p className="font-medium text-blue-700 capitalize">
                {entry.status}
              </p>
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
