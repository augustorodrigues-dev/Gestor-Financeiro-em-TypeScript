import { useState, useEffect } from 'react';
import { accountService } from '../services/accountService';
import { getTransactions, createTransaction, deleteTransaction, updateTransaction } from '../services/transactionService';
import CreditCardManager from './CreditCardManager'; 

interface Bank {
  ispb: string;
  name: string;
  code: number;
}

interface DashboardProps {
  userId: number;
  userNameSession: string;
}

export default function Dashboard({ userId, userNameSession }: DashboardProps) {
  const [userName, setUserName] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [officialBanks, setOfficialBanks] = useState<Bank[]>([]);

  const [editingTxId, setEditingTxId] = useState<number | null>(null);
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('EXPENSE');
  const [txAccountId, setTxAccountId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  const [selectedBankName, setSelectedBankName] = useState('');
  const [accountType, setAccountType] = useState('CORRENTE');

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);

      const [contas, transacoes, bancosFiltro] = await Promise.all([
        accountService.getUserAccounts(),
        getTransactions(),
        accountService.getBanks()
      ]);

      const listaContas = Array.isArray(contas) ? contas : [];
      const listaTransacoes = Array.isArray(transacoes) ? transacoes : [];
      const listaBancos = Array.isArray(bancosFiltro) ? bancosFiltro : [];

      const saldoCalculado = listaContas.reduce((acc: number, conta: any) => acc + Number(conta.balance), 0);

      setBalance(saldoCalculado);
      setAccounts(listaContas);
      setTransactions(listaTransacoes);

      setOfficialBanks(listaBancos.filter((b: Bank) => b.name));

      setUserName(userNameSession || "Usuário");

      if (listaContas.length > 0 && !txAccountId) {
        setTxAccountId(listaContas[0].id.toString());
      }
    } catch (error) {
      console.error("Erro ao carregar dados do Dashboard:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, [userId, userNameSession]);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAccountId) return alert("Crie uma conta primeiro!");

    const payload = {
      description: txDesc,
      amount: Number(txAmount),
      type: txType,
      accountId: Number(txAccountId),
      date: new Date(txDate).toISOString(),
    };

    try {
      if (editingTxId) {
        await updateTransaction(editingTxId, payload);
        alert('✏️ Transação atualizada com sucesso!');
        setEditingTxId(null);
      } else {
        await createTransaction(payload);
      }
      setTxDesc(''); setTxAmount('');

      loadDashboardData();
    } catch (error: any) { alert(error.message); }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankName) return alert("Selecione uma instituição financeira.");

    try {
      await accountService.createAccount({
        name: selectedBankName,
        balance: 0,
        type: accountType,
        userId
      });
      setSelectedBankName('');
      setAccountType('CORRENTE');
      alert('🏛️ Nova conta vinculada com sucesso!');
      loadDashboardData();
    } catch (error: any) { alert(error.message); }
  };

  const handleEditClick = (tx: any) => {
    setEditingTxId(tx.id);
    setTxDesc(tx.description);
    setTxAmount(tx.amount.toString());
    setTxType(tx.type);
    setTxAccountId(tx.accountId.toString());
    setTxDate(new Date(tx.date).toISOString().split('T')[0]);
  };

  const handleCancelEdit = () => {
    setEditingTxId(null);
    setTxDesc(''); setTxAmount('');
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!window.confirm("Deseja apagar esta transação? O saldo será recalculado.")) return;
    try {
      await deleteTransaction(id);
      if (editingTxId === id) handleCancelEdit();
      loadDashboardData();
    } catch (error: any) { alert(error.message); }
  };

  if (loadingData) return (
    <div className="flex flex-col items-center justify-center gap-3 p-12 text-center text-neutral-500">
      <div className="h-8 w-8 animate-spin-slow rounded-full border-2 border-neutral-200 border-t-brand-500" aria-hidden="true" />
      <span className="animate-pulse-soft">Carregando seus dados...</span>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">

      <div className="rounded-xl2 bg-gradient-brand p-6 text-white shadow-soft animate-fade-in-down sm:p-8">
        <h1 className="text-2xl font-bold text-shadow-sm sm:text-3xl">
          👋 Bem-vindo de volta, <span className="font-extrabold text-yellow-300">{userName}</span>!
        </h1>
        <p className="mt-1.5 text-sm text-brand-100">Aqui está o resumo financeiro das suas contas e despesas do mês.</p>
      </div>

      <div className="rounded-xl border-l-4 border-success-500 bg-white p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 sm:text-sm">Saldo Consolidado</h2>
        <p className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${balance >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        <div className="space-y-6">

          <div className={`rounded-xl border bg-white p-5 shadow-card transition-all duration-200 ${editingTxId ? 'border-warning-400 ring-2 ring-warning-400/20' : 'border-neutral-200'}`}>
            <h3 className="mb-4 font-bold text-neutral-800">{editingTxId ? '✏️ Editar Lançamento' : 'Nova Transação'}</h3>
            <form onSubmit={handleSaveTransaction} className="space-y-3">
              <input required type="text" placeholder="Ex: Supermercado" value={txDesc} onChange={e => setTxDesc(e.target.value)} aria-label="Descrição da transação" className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-colors duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
              <div className="flex gap-2">
                <input required type="number" step="0.01" placeholder="R$ 0,00" value={txAmount} onChange={e => setTxAmount(e.target.value)} aria-label="Valor da transação" className="w-2/3 rounded-lg border border-neutral-300 p-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-colors duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
                <select value={txType} onChange={e => setTxType(e.target.value)} aria-label="Tipo da transação" className={`w-1/3 rounded-lg border border-neutral-300 p-2.5 text-sm font-semibold outline-none transition-colors duration-200 focus:ring-2 focus:ring-brand-500/30 ${txType === 'INCOME' ? 'text-success-600' : 'text-danger-600'}`}>
                  <option value="EXPENSE">Despesa</option>
                  <option value="INCOME">Receita</option>
                </select>
              </div>
              <select value={txAccountId} onChange={e => setTxAccountId(e.target.value)} aria-label="Conta da transação" className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm text-neutral-900 outline-none transition-colors duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30">
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
              <input required type="date" value={txDate} onChange={e => setTxDate(e.target.value)} aria-label="Data da transação" className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm text-neutral-900 outline-none transition-colors duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
              <div className="flex gap-2">
                <button type="submit" className={`w-full rounded-lg py-2.5 font-bold text-white shadow-sm transition-all duration-200 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${editingTxId ? 'bg-warning-500 hover:bg-warning-600 focus-visible:ring-warning-500' : 'bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-500'}`}>{editingTxId ? 'Atualizar' : 'Salvar Transação'}</button>
                {editingTxId && <button type="button" onClick={handleCancelEdit} className="rounded-lg bg-neutral-200 px-3 font-bold text-neutral-700 transition-colors hover:bg-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2">Cancelar</button>}
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
            <h3 className="mb-3 text-sm font-bold text-neutral-800">Vincular Conta Financeira</h3>
            <form onSubmit={handleCreateAccount} className="space-y-3">

              <div>
                <label htmlFor="dash-bank" className="mb-1 block text-xs font-medium text-neutral-500">Instituição (Brasil API)</label>
                <select
                  id="dash-bank"
                  required
                  value={selectedBankName}
                  onChange={e => setSelectedBankName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm text-neutral-900 outline-none transition-colors duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                >
                  <option value="" disabled>Selecione o banco...</option>
                  <option value="Outro / Carteira Física">Outro (Carteira Física / Espécie)</option>
                  {officialBanks.map((bank, index) => (
                    <option key={index} value={bank.name}>
                      {bank.code ? `${bank.code} - ` : ''}{bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="dash-acctype" className="mb-1 block text-xs font-medium text-neutral-500">Tipo de Conta</label>
                <select
                  id="dash-acctype"
                  value={accountType}
                  onChange={e => setAccountType(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm text-neutral-900 outline-none transition-colors duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                >
                  <option value="CORRENTE">Conta Corrente</option>
                  <option value="POUPANCA">Poupança</option>
                  <option value="CARTEIRA">Carteira / Dinheiro Vivo</option>
                </select>
              </div>

              <button type="submit" className="w-full rounded-lg bg-neutral-800 py-2.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 focus-visible:ring-offset-2">
                + Adicionar Conta Oficial
              </button>
            </form>
          </div>

        </div>

        <div className="flex flex-col rounded-xl border border-neutral-200 bg-white shadow-card md:col-span-2">
          <div className="border-b border-neutral-200 p-5"><h3 className="font-bold text-neutral-800">Extrato de Movimentações</h3></div>
          <div className="scrollbar-thin max-h-[500px] overflow-y-auto p-0">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center text-neutral-400">
                <span className="text-3xl" aria-hidden="true">🗒️</span>
                <p>Nenhuma transação registrada ainda.</p>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {transactions.map(tx => (
                  <li key={tx.id} className={`group flex items-center justify-between p-4 transition-colors ${editingTxId === tx.id ? 'bg-warning-50' : 'hover:bg-neutral-50'}`}>
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-800">{tx.description}</span>
                      <span className="text-xs text-neutral-500">{new Date(tx.date).toLocaleDateString('pt-BR')} • {accounts.find(a => a.id === tx.accountId)?.name || 'Conta'}</span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className={`font-bold tabular-nums ${tx.type === 'INCOME' ? 'text-success-600' : 'text-danger-600'}`}>{tx.type === 'INCOME' ? '+' : '-'} R$ {Number(tx.amount).toFixed(2)}</span>
                      <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                        <button type="button" onClick={() => handleEditClick(tx)} aria-label={`Editar transação ${tx.description}`} title="Editar" className="rounded p-1.5 text-neutral-500 transition-colors hover:bg-warning-50 hover:text-warning-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-warning-500">✏️</button>
                        <button type="button" onClick={() => handleDeleteTransaction(tx.id)} aria-label={`Excluir transação ${tx.description}`} title="Excluir" className="rounded p-1.5 text-neutral-500 transition-colors hover:bg-danger-50 hover:text-danger-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500">🗑️</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>

      {}
      <CreditCardManager />

    </div>
  );
}