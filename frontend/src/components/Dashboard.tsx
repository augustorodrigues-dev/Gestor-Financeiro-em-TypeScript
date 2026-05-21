import { useState, useEffect } from 'react';
import { getBanks, createAccount } from '../services/accountService';

interface Bank {
  ispb: string;
  name: string;
  code: number;
}

interface DashboardProps {
  userId: number;
}

export default function Dashboard({ userId }: DashboardProps) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState('CORRENTE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const banksData = await getBanks();
        setBanks(banksData.filter((b: Bank) => b.name)); 
      } catch (error) {
        console.error("Erro ao carregar os bancos:", error);
      }
    };
    fetchBanks();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createAccount({
        name: selectedBank,
        balance: Number(balance),
        type: type,
        userId: userId, 
      });

      alert('✅ Conta financeira criada com sucesso no PostgreSQL!');
      
      setSelectedBank('');
      setBalance('');
      setType('CORRENTE');
    } catch (error: any) {
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Cadastrar Nova Conta</h1>
      
      <form onSubmit={handleCreateAccount} className="bg-white shadow-md rounded-lg p-6 space-y-4 border border-gray-200">
        
        {}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-600 mb-1">Instituição Financeira</label>
          <select 
            required
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="" disabled>Selecione seu banco...</option>
            {banks.map((bank, index) => (
              <option key={index} value={bank.name}>
                {bank.code ? `${bank.code} - ` : ''}{bank.name}
              </option>
            ))}
            <option value="Outro (Carteira/Espécie)">Outro (Carteira Física)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">Tipo de Conta</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="CORRENTE">Conta Corrente</option>
              <option value="POUPANCA">Poupança</option>
              <option value="CARTEIRA">Carteira (Dinheiro Físico)</option>
            </select>
          </div>

          {}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">Saldo Inicial (R$)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
              className="border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 transition-colors disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Cadastrar Conta'}
        </button>
      </form>
    </div>
  );
}