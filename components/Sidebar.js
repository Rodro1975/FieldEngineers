"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  FaHome,
  FaUsers,
  FaProjectDiagram,
  FaTasks,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaCommentDollar,
} from "react-icons/fa";
import { FaPerson } from "react-icons/fa6";

export default function Sidebar({ userEmail }) {
  const router = useRouter();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen overflow-x-hidden box-border">
      <div className="p-6 border-b">
        <p className="text-sm text-gray-500">Bienvenido</p>
        <p className="font-semibold break-words">{userEmail}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full text-left"
        >
          <FaHome /> Inicio
        </Link>
        <Link
          href="/dashboard/engineers"
          className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full text-left"
        >
          <FaUsers /> Ingenieros
        </Link>
        <Link
          href="/dashboard/clients"
          className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full text-left"
        >
          <FaPerson /> Clientes
        </Link>
        <Link
          href="/dashboard/projects"
          className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full text-left"
        >
          <FaProjectDiagram /> Proyectos
        </Link>
        <Link
          href="/dashboard/assignments"
          className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full text-left"
        >
          <FaTasks /> Asignaciones
        </Link>
        <Link
          href="/reports"
          className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full text-left"
        >
          <FaFileAlt /> Reportes
        </Link>
        <Link
          href="/contabilidad"
          className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full text-left"
        >
          <FaCommentDollar /> Contabilidad
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full text-left"
        >
          <FaCog /> Configuración
        </Link>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          }}
          className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 w-full text-left"
        >
          <FaSignOutAlt /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
