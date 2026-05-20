import React, { useEffect, useState } from 'react';
import { transactionService, TransactionData } from '../services/transactionService';

export default function Dashboard() {
  const [balance, setBalance] = useState<number>(0);
  const [banks, setBanks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  // NOVO: Controle do Modal e do Formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'EXPENSE',
    date: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD para o input de data
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault(); 

    const novaTransacao: TransactionData = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type as 'INCOME' | 'EXPENSE' | 'TRANSFER',
      date: new Date(formData.date).toISOString() 
    };

    try {
      const savedTransaction = await transactionService.createTransaction(novaTransacao);
      setTransactions([savedTransaction, ...transactions]);
      
      const valorAjustado = novaTransacao.type === 'EXPENSE' ? -novaTransacao.amount : novaTransacao.amount;
      setBalance(prevBalance => prevBalance + valorAjustado);
      
      setIsModalOpen(false);
      setFormData({
        description: '',
        amount: '',
        type: 'EXPENSE',
        date: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      alert("Erro ao salvar a transação no banco de dados.");
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {}
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
          <h2 className="text-lg text-gray-500 mb-2">Saldo Atual (Provisório)</h2>
          <h3 className="text-3xl font-bold text-gray-800">R$ {balance.toFixed(2)}</h3>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition font-semibold shadow-sm"
          >
            + Nova Transação
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

      {/* Lista de Extrato Real */}
      <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Extrato Real </h2>
        
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

      {}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Nova Transação</h2>
            
            <form onSubmit={handleSubmitTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input 
                  type="text" 
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Conta de Luz"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    name="amount"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input 
                    type="date" 
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="EXPENSE">Despesa</option>
                  <option value="INCOME">Receita</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded transition"
                >
                  Salvar Transação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}