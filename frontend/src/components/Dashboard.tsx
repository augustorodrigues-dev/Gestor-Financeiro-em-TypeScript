import React, { useEffect, useState } from 'react';
import { transactionService, TransactionData } from '../services/transactionService';

export default function Dashboard() {
  const [balance, setBalance] = useState<number>(0);
  const [banks, setBanks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/banks')
      .then(res => res.json())
      .then(data => {
        if (data.success) setBanks(data.banks);
      })
      .catch(() => console.log("Erro ao buscar bancos"));

    fetch('http://localhost:3001/api/balance')
      .then(res => res.json())
      .then(data => setBalance(data.balance))
      .catch(() => console.log("Erro ao buscar saldo"));

    const loadTransactions = async () => {
      try {
        const data = await transactionService.getTransactions(1); 
        setTransactions(data);
      } catch (error) {
        console.error("Erro ao carregar transações", error);
      }
    };
    
    loadTransactions();
  }, []);

  const handleTestTransaction = async () => {
    const novaTransacao: TransactionData = {
      amount: 150.50,
      date: new Date().toISOString(),
      description: "Compra no supermercado",
      type: "EXPENSE"
    };

    try {
      const savedTransaction = await transactionService.createTransaction(novaTransacao);
      setTransactions([savedTransaction, ...transactions]);
      
      setBalance(prevBalance => prevBalance - novaTransacao.amount);
      alert("Sucesso! Transação gravada no PostgreSQL com Prisma!");
    } catch (error) {
      alert("Erro ao salvar a transação no banco de dados.");
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {}
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
          <h2 className="text-lg text-gray-500 mb-2">Saldo Atual (Provisório)</h2>
          <h3 className="text-3xl font-bold text-gray-800">R$ {balance.toFixed(2)}</h3>
          
          <button 
            onClick={handleTestTransaction}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
          >
            - Testar Inserção: Supermercado (R$ 150,50)
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

      {}
      <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Extrato Real (PostgreSQL)</h2>
        
        {transactions.length === 0 ? (
          <p className="text-gray-500">Ainda não há transações registradas no banco.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {transactions.map(t => (
              <li key={t.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{t.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`font-bold ${t.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500'}`}>
                  {t.type === 'EXPENSE' ? '- ' : '+ '}
                  R$ {Number(t.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      
    </div>
  );
}