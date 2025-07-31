"use client";

import { useEffect, useState, useCallback } from "react";
import supabase from "@/lib/supabaseClient";
import { toast, Toaster } from "react-hot-toast";
import { FaEdit, FaTrash, FaEllipsisV, FaMoneyBillWave } from "react-icons/fa";
import EditIncomes from "@/components/EditIncomes";
import ModalConfirm from "@/components/ModalConfirm";
import ModalPaymentRecord from "@/components/ModalPaymentRecord";

export default function ShowIncomes({ refreshSignal }) {
  const [incomes, setIncomes] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [paymentModal, setPaymentModal] = useState(null);

  useEffect(() => {
    const updateRowsPerPage = () => {
      const width = window.innerWidth;
      setRowsPerPage(width < 768 ? 6 : 7);
    };
    updateRowsPerPage();
    window.addEventListener("resize", updateRowsPerPage);
    return () => window.removeEventListener("resize", updateRowsPerPage);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleClear = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  const fetchIncomes = useCallback(async () => {
    const { data, error } = await supabase
      .from("incomes")
      .select(
        `
      *,
      clients_service:client_id_service (company_name),
      clients_payer:client_id_payer (company_name),
      projects (name)
    `
      )
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar ingresos");
      return;
    }

    const filtered = data.filter((item) => {
      const client = item.clients_service?.company_name || "";
      const project = item.projects?.name || "";
      return (
        client.toLowerCase().includes(debouncedSearch) ||
        project.toLowerCase().includes(debouncedSearch)
      );
    });

    setIncomes(debouncedSearch ? filtered : data);
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes, refreshSignal]);

  const openEditModal = (income) => {
    setSelectedIncome(income);
    setModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedIncome(null);
    setModalOpen(false);
  };

  const toggleAnular = (income) => {
    setConfirmDialog({
      message: income.anulado
        ? "¿Deseas reactivar este ingreso?"
        : "¿Deseas anular este ingreso?",
      onConfirm: async () => {
        setConfirmDialog(null);
        const { error } = await supabase
          .from("incomes")
          .update({ anulado: !income.anulado })
          .eq("id", income.id);
        if (error) return toast.error("Error al actualizar estado");
        toast.success(
          income.anulado ? "Ingreso reactivado" : "Ingreso anulado"
        );
        fetchIncomes();
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const toggleDropdown = (id) => {
    setDropdownOpenId(dropdownOpenId === id ? null : id);
  };

  const totalPages = Math.ceil(incomes.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const paginatedIncomes = incomes.slice(startIdx, startIdx + rowsPerPage);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] gap-4 px-2">
      <Toaster position="top-center" />

      {/* Barra de búsqueda */}
      <div className="flex items-center gap-2 max-w-full">
        <input
          type="text"
          placeholder="Buscar por cliente o proyecto..."
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

      {/* Contenedor tabla con scroll vertical y horizontal */}
      <div className="flex-1 overflow-auto border border-gray-200 rounded-md shadow-sm">
        <div className="min-w-[1400px] overflow-x-auto">
          <table className="w-full border-collapse table-auto">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300 whitespace-nowrap">
                  Fecha de Ejecución
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300 whitespace-nowrap">
                  Cliente (servicio)
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300 whitespace-nowrap">
                  Cliente (pagador)
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300 whitespace-nowrap">
                  Proyecto
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300 whitespace-nowrap">
                  Horas
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300 whitespace-nowrap">
                  Tarifa
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300 whitespace-nowrap">
                  Total
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300 whitespace-nowrap max-w-xs">
                  Descripción
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300 whitespace-nowrap max-w-xs">
                  Notas
                </th>
                <th className="text-left p-3 text-gray-700 font-semibold text-sm border-b border-gray-300 whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedIncomes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-gray-500">
                    No hay ingresos registrados.
                  </td>
                </tr>
              ) : (
                paginatedIncomes.map((income, idx) => {
                  const today = new Date();
                  const serviceDate = income.service_date
                    ? new Date(income.service_date)
                    : null;
                  const due = income.due_date
                    ? new Date(income.due_date)
                    : serviceDate
                    ? new Date(serviceDate.getTime() + 30 * 86400000)
                    : null;
                  const paid = !!income.paid_date;

                  let rowClass = "";
                  if (income.anulado) {
                    rowClass = "bg-gray-100 text-red-700 italic line-through";
                  } else if (paid) {
                    rowClass = "bg-green-50 text-green-800";
                  } else if (due && due < today) {
                    rowClass = "bg-red-50 text-red-800";
                  } else if (due && due >= today) {
                    rowClass = "bg-yellow-50 text-yellow-800";
                  }

                  return (
                    <tr key={income.id} className={rowClass}>
                      <td className="p-3 text-sm whitespace-nowrap">
                        {income.service_date
                          ? income.service_date
                              .split("T")[0]
                              .split("-")
                              .reverse()
                              .join("/")
                          : "-"}
                      </td>
                      <td className="p-3 text-sm whitespace-nowrap">
                        {income.clients_service?.company_name || "-"}
                      </td>
                      <td className="p-3 text-sm whitespace-nowrap">
                        {income.clients_payer?.company_name || "-"}
                      </td>
                      <td className="p-3 text-sm whitespace-nowrap">
                        {income.projects?.name || "-"}
                      </td>
                      <td className="p-3 text-sm whitespace-nowrap">
                        {income.hours_worked}
                      </td>
                      <td className="p-3 text-sm whitespace-nowrap">
                        ${income.rate_applied}
                      </td>
                      <td className="p-3 text-sm font-bold text-green-700 whitespace-nowrap">
                        ${income.total_usd}
                      </td>
                      <td className="p-3 text-sm max-w-xs whitespace-normal">
                        {income.activity || "-"}
                      </td>
                      <td className="p-3 text-sm max-w-xs whitespace-normal">
                        {income.notes || "-"}
                      </td>
                      <td className="p-3 text-sm relative whitespace-nowrap">
                        <button
                          onClick={() => toggleDropdown(income.id)}
                          className="text-gray-700 hover:text-blue-600"
                          aria-haspopup="true"
                          aria-expanded={dropdownOpenId === income.id}
                          title="Opciones"
                        >
                          <FaEllipsisV />
                        </button>
                        {dropdownOpenId === income.id && (
                          <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-40">
                            <button
                              onClick={() => {
                                openEditModal(income);
                                setDropdownOpenId(null);
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-blue-100 w-full"
                            >
                              <FaEdit /> Editar
                            </button>
                            <button
                              onClick={() => {
                                toggleAnular(income);
                                setDropdownOpenId(null);
                              }}
                              className={`flex items-center gap-2 px-4 py-2 text-sm w-full ${
                                income.anulado
                                  ? "text-green-700 hover:bg-green-100"
                                  : "text-red-700 hover:bg-red-100"
                              }`}
                            >
                              <FaTrash />
                              {income.anulado ? "Reactivar" : "Anular"}
                            </button>
                            <button
                              onClick={() => {
                                setPaymentModal(income);
                                setDropdownOpenId(null);
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-100 w-full"
                            >
                              <FaMoneyBillWave /> Registrar pago
                            </button>
                          </div>
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

      {/* Paginación */}
      {incomes.length > rowsPerPage && (
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

      {/* Modals y diálogos */}
      {modalOpen && selectedIncome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-2xl relative">
            <EditIncomes
              income={selectedIncome}
              onClose={closeEditModal}
              onUpdated={fetchIncomes}
            />
          </div>
        </div>
      )}
      {confirmDialog && (
        <ModalConfirm
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
      {paymentModal && (
        <ModalPaymentRecord
          income={paymentModal}
          onClose={() => setPaymentModal(null)}
          onUpdated={fetchIncomes}
        />
      )}
    </div>
  );
}
