import { useState, useEffect } from 'react';
import { accountService } from '../services/accountService';

interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
  _count?: { transactions: number };
}

interface Bank {
  ispb: string;
  name: string;
  code: number;
  fullName: string;
}

export default function AccountManager() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]); 
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [type, setType] = useState('CORRENTE');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    loadAccounts();
    loadBanks(); 
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await accountService.getUserAccounts(); 
      // 🛡️ Blindagem para evitar tela branca caso a API não retorne um array
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadBanks = async () => {
    try {
      const data = await accountService.getBanks();
      setBanks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Erro ao buscar bancos da Brasil API:", err);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // 🚀 Removemos o userId daqui. O backend agora pega o ID direto do Token JWT!
      await accountService.createAccount({ 
        name, 
        type, 
        balance,
        userId: 0 // Mantido como dummy, já que o backend vai ignorar e usar o do Token
      });
      
      setName('');
      setBalance(0);
      loadAccounts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta conta?')) return;
    
    try {
      setError('');
      await accountService.deleteAccount(id);
      loadAccounts(); 
    } catch (err: any) {
      setError(err.message); 
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Minhas Contas</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateAccount} className="bg-white p-4 rounded shadow-md mb-8 flex gap-4 items-end">
        
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Nome da Instituição</label>
          <select 
            className="w-full border p-2 rounded bg-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          >
            <option value="" disabled>Selecione um banco oficial...</option>
            <option value="Carteira Física / Dinheiro">Carteira Física / Dinheiro</option>
            {banks.map((bank, index) => (
              <option key={bank.ispb || index} value={bank.name}>
                {bank.code ? `${bank.code} - ` : ''} {bank.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="w-48">
          <label className="block text-sm text-gray-600 mb-1">Tipo</label>
          <select 
            className="w-full border p-2 rounded bg-white"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="CORRENTE">Conta Corrente</option>
            <option value="POUPANCA">Poupança</option>
            <option value="INVESTIMENTO">Investimento</option>
          </select>
        </div>

        <div className="w-32">
          <label className="block text-sm text-gray-600 mb-1">Saldo Inicial (R$)</label>
          <input 
            type="number" 
            step="0.01"
            className="w-full border p-2 rounded"
            value={balance}
            onChange={(e) => setBalance(Number(e.target.value))}
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold transition">
          Adicionar
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map(account => (
          <div key={account.id} className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-gray-800">{account.name}</h3>
              <p className="text-sm text-gray-500">{account.type}</p>
              <p className="text-sm text-gray-400 mt-1">
                Transações vinculadas: {account._count?.transactions || 0}
              </p>
            </div>
            
            <div className="text-right flex flex-col items-end">
              <span className="text-xl font-bold text-gray-800 mb-2">
                R$ {Number(account.balance).toFixed(2)}
              </span>
              <button 
                onClick={() => handleDelete(account.id)}
                className="text-red-500 hover:text-red-700 text-sm font-semibold transition"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}