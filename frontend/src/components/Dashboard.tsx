import { useState, useEffect } from 'react';
import { createAccount, getUserBalance, getUserAccounts } from '../services/accountService';
import { getTransactions, createTransaction, deleteTransaction } from '../services/transactionService';

interface DashboardProps { userId: number; }

export default function Dashboard({ userId }: DashboardProps) {
  const [userName, setUserName] = useState<string>(''); 
  const [balance, setBalance] = useState<number>(0);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [newAccountName, setNewAccountName] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('EXPENSE');
  const [txAccountId, setTxAccountId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      
      const userResponse = await fetch(`http://localhost:3001/api/accounts/user/${userId}`);
      const userAccountsData = await userResponse.json();
      
      const [saldo, contas, transacoes] = await Promise.all([
        getUserBalance(userId),
        getUserAccounts(userId),
        getTransactions(userId)
      ]);
      
      if (userId === 1) setUserName("Jadão o Liso");
      else if (userId === 2) setUserName("DevOpsNando");
      else setUserName("Usuário");

      setBalance(saldo);
      setAccounts(contas);
      setTransactions(transacoes);
      
      if (contas.length > 0 && !txAccountId) {
        setTxAccountId(contas[0].id.toString());
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, [userId]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAccount({ name: newAccountName, balance: 0, type: 'CORRENTE', userId });
      setNewAccountName('');
      loadDashboardData();
    } catch (error: any) { alert(error.message); }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAccountId) return alert("Crie uma conta primeiro!");
    try {
      await createTransaction({
        description: txDesc,
        amount: Number(txAmount),
        type: txType,
        accountId: Number(txAccountId),
        date: new Date(txDate).toISOString(),
      });
      setTxDesc(''); setTxAmount('');
      loadDashboardData();
    } catch (error: any) { alert(error.message); }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!window.confirm("Deseja apagar esta transação? O saldo será recalculado.")) return;
    try {
      await deleteTransaction(id);
      loadDashboardData();
    } catch (error: any) { alert(error.message); }
  };

  if (loadingData) return <div className="p-8 text-center text-gray-500">Carregando seus dados...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white flex flex-col justify-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Bem-vindo de volta, <span className="text-yellow-300 font-extrabold">{userName}</span>!
        </h1>
        <p className="text-blue-100 text-sm mt-1">Aqui está o resumo financeiro das suas contas e despesas do mês.</p>
      </div>

      {}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
        <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Saldo Consolidado</h2>
        <p className={`text-4xl font-bold mt-2 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {}
        <div className="space-y-6">
          
          {}
          <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4">Nova Transação</h3>
            <form onSubmit={handleCreateTransaction} className="space-y-3">
              <input required type="text" placeholder="Ex: Supermercado" value={txDesc} onChange={e => setTxDesc(e.target.value)} className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500 text-gray-900" />
              
              <div className="flex gap-2">
                <input required type="number" step="0.01" placeholder="R$ 0,00" value={txAmount} onChange={e => setTxAmount(e.target.value)} className="w-2/3 border p-2 rounded text-sm outline-none focus:border-blue-500 text-gray-900" />
                <select value={txType} onChange={e => setTxType(e.target.value)} className={`w-1/3 border p-2 rounded text-sm font-semibold outline-none ${txType === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  <option value="EXPENSE">Despesa</option>
                  <option value="INCOME">Receita</option>
                </select>
              </div>

              <select value={txAccountId} onChange={e => setTxAccountId(e.target.value)} className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500 text-gray-900">
                {accounts.length === 0 && <option disabled value="">Nenhuma conta cadastrada</option>}
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>

              <input required type="date" value={txDate} onChange={e => setTxDate(e.target.value)} className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500 text-gray-900" />
              
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition">
                Salvar Transação
              </button>
            </form>
          </div>

          {}
          <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">Adicionar Conta / Carteira</h3>
            <form onSubmit={handleCreateAccount} className="flex gap-2">
              <input required type="text" placeholder="Nome (Ex: Inter)" value={newAccountName} onChange={e => setNewAccountName(e.target.value)} className="w-full border p-2 rounded text-sm outline-none text-gray-900" />
              <button type="submit" className="bg-gray-800 text-white px-4 rounded text-sm hover:bg-gray-700">+</button>
            </form>
          </div>

        </div>

        {}
        <div className="md:col-span-2 bg-white rounded-lg shadow border border-gray-200 flex flex-col">
          <div className="p-5 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Extrato de Movimentações</h3>
          </div>
          
          <div className="p-0 overflow-y-auto max-h-[500px]">
            {transactions.length === 0 ? (
              <p className="p-8 text-center text-gray-500">Nenhuma transação registrada ainda.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {transactions.map(tx => (
                  <li key={tx.id} className="p-4 hover:bg-gray-50 flex justify-between items-center group">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{tx.description}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(tx.date).toLocaleDateString('pt-BR')} • {accounts.find(a => a.id === tx.accountId)?.name || 'Conta'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} R$ {Number(tx.amount).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Apagar transação"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}