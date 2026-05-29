import { useState, useEffect } from 'react';
import { accountService } from '../services/accountService';
import { getTransactions, deleteTransaction } from '../services/transactionService';
import { goalService } from '../services/goalService';
import { categoryService } from '../services/categoryService'; // 🚀 Importado

interface DashboardProps {
  userId: number;
  userNameSession: string;
}

export default function Dashboard({ userId, userNameSession }: DashboardProps) {
  const [userName, setUserName] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // 🚀 Estado para categorias
  const [loadingData, setLoadingData] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      
      const [contas, transacoes, metas, listaCategorias] = await Promise.all([
        accountService.getUserAccounts(),
        getTransactions(),
        goalService.getGoals(),
        categoryService.getCategories()
      ]);

      setAccounts(Array.isArray(contas) ? contas : []);
      setTransactions(Array.isArray(transacoes) ? transacoes : []);
      setCategories(Array.isArray(listaCategorias) ? listaCategorias : []); // 🚀 Carregado
      
      if (metas && !metas.error) {
        setGoals(Array.isArray(metas) ? metas : []);
      }
      
      const listaContas = Array.isArray(contas) ? contas : [];
      const saldoCalculado = listaContas.reduce((acc, conta) => acc + Number(conta.balance), 0);
      setBalance(saldoCalculado);
      setUserName(userNameSession || "Usuário");

    } catch (error) {
      console.error("Erro ao carregar Dashboard:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, [userId, userNameSession]);

  const handleDeleteTransaction = async (id: number) => {
    if (!window.confirm("Deseja apagar esta transação? O saldo será recalculado.")) return;
    try {
      await deleteTransaction(id);
      loadDashboardData();
    } catch (error: any) { alert(error.message); }
  };

  if (loadingData) return <div className="p-12 text-center text-neutral-500">Carregando seus dados...</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in p-6">
      
      <div className="rounded-2xl bg-gradient-brand p-8 text-white shadow-soft">
        <h1 className="text-3xl font-bold">👋 Bem-vindo de volta, <span className="text-yellow-300">{userName}</span>!</h1>
        <p className="mt-2 text-brand-100">Aqui está o resumo financeiro das suas contas e despesas do mês.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border-l-4 border-success-500 bg-white p-6 shadow-card flex flex-col justify-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Patrimônio Consolidado</h2>
          <p className={`mt-2 text-4xl font-bold ${balance >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-neutral-800">🎯 Progresso das Metas</h3>
            <span className="text-sm font-medium text-blue-600">Top 3 ativas</span>
          </div>
          
          {goals.length === 0 ? (
            <p className="text-sm text-neutral-500 py-4 text-center">Nenhuma meta ativa no momento.</p>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 3).map(goal => (
                <div key={goal.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-neutral-700 truncate pr-2">{goal.name}</span>
                    <span className="text-neutral-600 font-bold">{goal.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div className="h-2 transition-all duration-500 ease-out bg-blue-500" style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white shadow-card">
        <div className="border-b border-neutral-200 p-5"><h3 className="font-bold text-neutral-800">Extrato de Movimentações</h3></div>
        <ul className="divide-y divide-neutral-100">
          {transactions.map(tx => {
            const categoria = categories.find(c => c.id === tx.categoryId);
            return (
              <li key={tx.id} className="group flex items-center justify-between p-4 hover:bg-neutral-50">
                <div className="flex flex-col">
                  <span className="font-semibold text-neutral-800">{tx.description}</span>
                  <span className="text-xs text-neutral-500">
                    {new Date(tx.date).toLocaleDateString('pt-BR')} • {accounts.find(a => a.id === tx.accountId)?.name || 'Conta'}
                    {categoria && <span className="ml-2 font-medium" style={{ color: categoria.color }}>🏷️ {categoria.name}</span>}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${tx.type === 'INCOME' ? 'text-success-600' : 'text-danger-600'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'} R$ {Number(tx.amount).toFixed(2)}
                  </span>
                  <button onClick={() => handleDeleteTransaction(tx.id)} className="opacity-0 group-hover:opacity-100 rounded p-1.5 text-red-400 hover:text-red-600 transition-all">🗑️</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}