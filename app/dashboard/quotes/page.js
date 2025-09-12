"use client";

import { useEffect } from "react";
import { useHeader } from "@/context/HeaderContext";
import {
  FaFileInvoiceDollar,
  FaFileAlt,
  FaSearch,
  FaPlus,
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QuotesPage() {
  const { setHeader } = useHeader();
  const router = useRouter();

  useEffect(() => {
    setHeader({
      title: "Cotizaciones",
      subtitle: "Elige el tipo de documento que quieres generar",
      actions: [
        {
          label: "Nueva cotización",
          icon: FaPlus,
          onClick: () => router.push("/dashboard/quotes/items"),
        },
        // Si quieres, agrega un segundo acceso rápido:
        // {
        //   label: "Historial",
        //   icon: FaSearch,
        //   onClick: () => router.push("/dashboard/quotes/sent"),
        // },
      ],
    });
  }, [setHeader, router]);

  const options = [
    {
      title: "Cotización por ítems",
      description:
        "Crea propuestas con conceptos, totales, validez y condiciones.",
      icon: FaFileInvoiceDollar,
      href: "/dashboard/quotes/items",
    },
    {
      title: "Documento personalizado",
      description: "Hoja membretada con texto libre para cartas y propuestas.",
      icon: FaFileAlt,
      href: "/dashboard/quotes/personalized",
    },
    {
      title: "Cotizaciones enviadas (historial)",
      description:
        "Busca, filtra y abre los PDFs de tus cotizaciones registradas.",
      icon: FaSearch,
      href: "/dashboard/quotes/sent",
    },
  ];

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {options.map(({ title, description, icon: Icon, href }) => (
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
