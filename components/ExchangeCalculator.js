"use client";

import { useState, useEffect } from "react";
import { FaDollarSign } from "react-icons/fa";
import { toast } from "react-hot-toast";

const ExchangeCalculator = () => {
  const [usdAmount, setUsdAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(17.5); // Valor inicial estimado
  const [mxnResult, setMxnResult] = useState(0);

  useEffect(() => {
    setMxnResult((usdAmount * exchangeRate).toFixed(2));
  }, [usdAmount, exchangeRate]);

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-center mb-4 text-blue-900 flex items-center justify-center gap-2">
        <FaDollarSign className="text-green-600" /> Calculadora de Tipo de
        Cambio
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Monto en USD:
          </label>
          <input
            type="number"
            value={usdAmount}
            onChange={(e) => setUsdAmount(parseFloat(e.target.value) || 0)}
            className="mt-1 w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo de cambio (USD a MXN):
          </label>
          <input
            type="number"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
            className="mt-1 w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="text-center mt-4">
          <p className="text-lg font-semibold text-gray-800">
            Resultado: <span className="text-green-600">${mxnResult} MXN</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExchangeCalculator;
