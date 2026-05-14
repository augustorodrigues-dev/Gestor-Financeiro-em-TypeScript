import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [rates, setRates] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    fetch('http://localhost:3001/api/balance')
      .then(res => res.json())
      .then(data => setBalance(data.balance));

    fetch('http://localhost:3001/api/exchange')
      .then(res => res.json())
      .then(data => {
        if (data.rates) setRates(data.rates);
      });
  }, []);

  const handleSimulateTransaction = () => {
    fetch('http://localhost:3001/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 100, description: 'Freelance', type: 'INCOME' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) setBalance(data.balance);
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Resumo da Conta */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg text-gray-500 mb-2">Saldo Atual</h2>
        <h3 className="text-3xl font-bold text-green-600">R$ {balance.toFixed(2)}</h3>
        <button 
          onClick={handleSimulateTransaction}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
        >
          + Simular Entrada de R$ 100
        </button>
      </div>

      {/* Módulo de Câmbio (Integração AwesomeAPI) */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg text-gray-500 mb-2">Cotações (Para BRL)</h2>
        {rates ? (
          <ul className="mt-2 space-y-2">
            <li className="flex justify-between border-b pb-1">
              <span>USD (Dólar Comercial)</span>
              <span className="font-bold">R$ {parseFloat(rates.USDBRL.bid).toFixed(2)}</span>
            </li>
            <li className="flex justify-between border-b pb-1">
              <span>EUR (Euro)</span>
              <span className="font-bold">R$ {parseFloat(rates.EURBRL.bid).toFixed(2)}</span>
            </li>
          </ul>
        ) : (
          <p className="text-sm text-gray-400">Carregando cotações em tempo real...</p>
        )}
      </div>
    </div>
  );
}