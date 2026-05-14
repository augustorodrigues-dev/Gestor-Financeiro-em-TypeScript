import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [balance, setBalance] = useState<number>(0);
  const [banks, setBanks] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/balance')
      .then(res => res.json())
      .then(data => setBalance(data.balance))
      .catch(() => console.log("Erro ao buscar saldo"));

    fetch('http://localhost:3001/api/banks')
      .then(res => res.json())
      .then(data => {
        if (data.success) setBanks(data.banks);
      })
      .catch(() => console.log("Erro ao buscar bancos"));
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
      {}
      <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
        <h2 className="text-lg text-gray-500 mb-2">Saldo Atual</h2>
        <h3 className="text-3xl font-bold text-gray-800">R$ {balance.toFixed(2)}</h3>
        <button 
          onClick={handleSimulateTransaction}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
        >
          + Simular Entrada de R$ 100
        </button>
      </div>

      {}
      <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
        <h2 className="text-lg text-gray-500 mb-2">Simular Criação de Conta</h2>
        <p className="text-sm text-gray-400 mb-4">Lista oficial de bancos puxada da Brasil API.</p>
        
        <select className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700">
          <option value="">Selecione uma instituição financeira...</option>
          {banks.map((bank, index) => (
            <option key={index} value={bank.code}>
              {bank.code} - {bank.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}