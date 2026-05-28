import { useState, useEffect } from 'react';
import { accountService } from '../services/accountService'; 
import { getTransactions, createTransaction, deleteTransaction, updateTransaction } from '../services/transactionService';

interface Bank {
  ispb: string;
  name: string;
  code: number;
}

interface DashboardProps { userId: number; }

export default function Dashboard({ userId }: DashboardProps) {
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
        getTransactions(userId), 
        accountService.getBanks() 
      ]);
      
      // 🛡️ A MÁGICA DA BLINDAGEM AQUI: Garante que sempre teremos um Array, mesmo se a API der erro
      const listaContas = Array.isArray(contas) ? contas : [];
      const listaTransacoes = Array.isArray(transacoes) ? transacoes : [];
      const listaBancos = Array.isArray(bancosFiltro) ? bancosFiltro : [];
      
      const saldoCalculado = listaContas.reduce((acc: number, conta: any) => acc + Number(conta.balance), 0);
      
      setBalance(saldoCalculado);
      setAccounts(listaContas);
      setTransactions(listaTransacoes);
      
      setOfficialBanks(listaBancos.filter((b: Bank) => b.name)); 

      if (userId === 1) setUserName("Jadão o Liso");
      else if (userId === 2) setUserName("DevOps Nando");
      else setUserName("Usuário");
      
      if (listaContas.length > 0 && !txAccountId) {
        setTxAccountId(listaContas[0].id.toString());
      }
    } catch (error) {
      console.error("Erro ao carregar dados do Dashboard:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, [userId]);

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

  if (loadingData) return <div className="p-8 text-center text-gray-500">Carregando seus dados...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">
          👋 Bem-vindo de volta, <span className="text-yellow-300 font-extrabold">{userName}</span>!
        </h1>
        <p className="text-blue-100 text-sm mt-1">Aqui está o resumo financeiro das suas contas e despesas do mês.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
        <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Saldo Consolidado</h2>
        <p className={`text-4xl font-bold mt-2 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="space-y-6">
          
          <div className={`bg-white rounded-lg shadow p-5 border transition-all ${editingTxId ? 'border-amber-400 bg-amber-50/10' : 'border-gray-200'}`}>
            <h3 className="font-bold text-gray-800 mb-4">{editingTxId ? '✏️ Editar Lançamento' : 'Nova Transação'}</h3>
            <form onSubmit={handleSaveTransaction} className="space-y-3">
              <input required type="text" placeholder="Ex: Supermercado" value={txDesc} onChange={e => setTxDesc(e.target.value)} className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500 text-gray-900" />
              <div className="flex gap-2">
                <input required type="number" step="0.01" placeholder="R$ 0,00" value={txAmount} onChange={e => setTxAmount(e.target.value)} className="w-2/3 border p-2 rounded text-sm outline-none focus:border-blue-500 text-gray-900" />
                <select value={txType} onChange={e => setTxType(e.target.value)} className={`w-1/3 border p-2 rounded text-sm font-semibold outline-none ${txType === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  <option value="EXPENSE">Despesa</option>
                  <option value="INCOME">Receita</option>
                </select>
              </div>
              <select value={txAccountId} onChange={e => setTxAccountId(e.target.value)} className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500 text-gray-900">
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
              <input required type="date" value={txDate} onChange={e => setTxDate(e.target.value)} className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500 text-gray-900" />
              <div className="flex gap-2">
                <button type="submit" className={`w-full text-white font-bold py-2 rounded transition ${editingTxId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>{editingTxId ? 'Atualizar' : 'Salvar Transação'}</button>
                {editingTxId && <button type="button" onClick={handleCancelEdit} className="bg-gray-300 text-gray-700 font-bold px-3 rounded hover:bg-gray-400">Cancelar</button>}
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Vincular Conta Financeira</h3>
            <form onSubmit={handleCreateAccount} className="space-y-3">
              
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Instituição (Brasil API)</label>
                <select 
                  required
                  value={selectedBankName}
                  onChange={e => setSelectedBankName(e.target.value)}
                  className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500 text-gray-900"
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
                <label className="text-xs text-gray-500 font-medium block mb-1">Tipo de Conta</label>
                <select 
                  value={accountType} 
                  onChange={e => setAccountType(e.target.value)}
                  className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500 text-gray-900"
                >
                  <option value="CORRENTE">Conta Corrente</option>
                  <option value="POUPANCA">Poupança</option>
                  <option value="CARTEIRA">Carteira / Dinheiro Vivo</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 rounded text-xs transition">
                + Adicionar Conta Oficial
              </button>
            </form>
          </div>

        </div>

        <div className="md:col-span-2 bg-white rounded-lg shadow border border-gray-200 flex flex-col">
          <div className="p-5 border-b border-gray-200"><h3 className="font-bold text-gray-800">Extrato de Movimentações</h3></div>
          <div className="p-0 overflow-y-auto max-h-[500px]">
            {transactions.length === 0 ? (
              <p className="p-8 text-center text-gray-500">Nenhuma transação registrada ainda.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {transactions.map(tx => (
                  <li key={tx.id} className={`p-4 flex justify-between items-center group transition-colors ${editingTxId === tx.id ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{tx.description}</span>
                      <span className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString('pt-BR')} • {accounts.find(a => a.id === tx.accountId)?.name || 'Conta'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>{tx.type === 'INCOME' ? '+' : '-'} R$ {Number(tx.amount).toFixed(2)}</span>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                        <button onClick={() => handleEditClick(tx)} className="text-gray-500 hover:text-amber-600 p-1">✏️</button>
                        <button onClick={() => handleDeleteTransaction(tx.id)} className="text-gray-500 hover:text-red-600 p-1">🗑️</button>
                      </div>
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