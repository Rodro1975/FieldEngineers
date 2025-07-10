"use client";

export default function RateCard() {
  const tarifas = [
    { label: "Por hora", valor: 15 },
    { label: "Media jornada", valor: 50 },
    { label: "Jornada completa", valor: 110 },
    { label: "Hora extra", valor: 15 },
  ];

  return (
    <div className="bg-blue-50 p-6 rounded-2xl shadow-inner">
      <h3 className="text-blue-900 text-lg font-bold mb-4">
        Mis tarifas para Ingenieros
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tarifas.map((tarifa, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-xl shadow-md transform hover:scale-105 transition-all"
          >
            <div className="text-sm uppercase tracking-wide font-medium mb-2 text-blue-100">
              {tarifa.label}
            </div>
            <div className="text-3xl font-bold">
              ${tarifa.valor.toFixed(2)}
              <span className="text-sm font-light ml-1">USD</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
