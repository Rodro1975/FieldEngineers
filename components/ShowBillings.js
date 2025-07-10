"use client";

import React from "react";
import Link from "next/link";
import {
  FaDollarSign,
  FaFileInvoiceDollar,
  FaMoneyCheckAlt,
  FaChartLine,
  FaTools,
} from "react-icons/fa";
import RateCard from "./RateCard";

const CardBilling = ({ title, description, icon, href }) => (
  <Link
    href={href}
    className="flex flex-col items-start gap-3 p-5 border border-gray-200 rounded-xl shadow hover:shadow-md transition bg-white hover:bg-blue-50"
  >
    <div className="text-3xl text-black">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold text-blue-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </Link>
);

export default function ShowBillings({ refreshSignal }) {
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold text-blue-800">
        Centro de Gestión Contable
      </h2>
      <p className="text-gray-600">
        Accede a tarifas por cliente, facturación, pagos, reportes y más.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        <CardBilling
          title="Tarifas por Cliente"
          description="Consulta y registra las tarifas acordadas con tus clientes."
          icon={<FaDollarSign />}
          href="/dashboard/billings/rates"
        />
        <CardBilling
          title="Facturación e Ingresos"
          description="Registra facturas, cobros y pagos recibidos por proyectos."
          icon={<FaFileInvoiceDollar />}
          href="/dashboard/billings/invoices"
        />
        <CardBilling
          title="Pagos a Ingenieros"
          description="Controla los egresos por servicios técnicos y actividades."
          icon={<FaMoneyCheckAlt />}
          href="/dashboard/billings/payments"
        />
        <CardBilling
          title="Viáticos y Materiales"
          description="Administra gastos por insumos, herramientas y traslados."
          icon={<FaTools />}
          href="/dashboard/billings/expenses"
        />
        <CardBilling
          title="Reportes Financieros"
          description="Visualiza balances, estados de cuenta e indicadores clave."
          icon={<FaChartLine />}
          href="/dashboard/billings/reports"
        />
      </div>
      {/* Tarjeta de tarifas propias */}
      <div>
        <RateCard />
      </div>
    </div>
  );
}
