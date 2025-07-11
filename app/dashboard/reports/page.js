"use client";

import { useEffect } from "react";
import { useHeader } from "@/context/HeaderContext";
import { FaUsers, FaBriefcase, FaTasks, FaClipboardList } from "react-icons/fa";
import Link from "next/link";

export default function ReportsPage() {
  const { setHeader } = useHeader();

  useEffect(() => {
    setHeader({
      title: "Reportes",
      subtitle:
        "Consulta y genera reportes de ingenieros, clientes, proyectos y más",
      actions: [],
    });
  }, [setHeader]);

  const reports = [
    {
      title: "Ingenieros",
      description: "Información, contacto y estado de disponibilidad.",
      icon: FaUsers,
      href: "/dashboard/reports/engineers",
    },
    {
      title: "Clientes",
      description: "Listado de clientes, contactos y actividad reciente.",
      icon: FaBriefcase,
      href: "/dashboard/reports/clients",
    },
    {
      title: "Proyectos",
      description: "Resumen de proyectos activos y cerrados.",
      icon: FaClipboardList,
      href: "/dashboard/reports/projects",
    },
    {
      title: "Asignaciones",
      description: "Reporte de tareas asignadas por ingeniero y proyecto.",
      icon: FaTasks,
      href: "/dashboard/reports/assignments",
    },
  ];

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map(({ title, description, icon: Icon, href }) => (
        <Link
          key={title}
          href={href}
          className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition p-6 flex flex-col gap-3 hover:border-blue-500"
        >
          <div className="text-blue-700 text-3xl">
            <Icon />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </Link>
      ))}
    </div>
  );
}
