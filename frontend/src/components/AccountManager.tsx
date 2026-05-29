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
      await accountService.createAccount({
        name,
        type,
        balance,
        userId: 0 
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
    <div className="mx-auto max-w-4xl p-4 sm:p-6 animate-fade-in">
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-neutral-800">Minhas Contas</h2>

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border-l-4 border-danger-400 bg-danger-50 px-4 py-3 text-danger-700 animate-fade-in">
          <span aria-hidden="true">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCreateAccount} className="mb-8 flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-card sm:flex-row sm:items-end">

        <div className="flex-1">
          <label htmlFor="acc-name" className="mb-1 block text-sm font-medium text-neutral-600">Nome da Instituição</label>
          <select
            id="acc-name"
            className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-sm text-neutral-900 outline-none transition-colors duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
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

        <div className="sm:w-48">
          <label htmlFor="acc-type" className="mb-1 block text-sm font-medium text-neutral-600">Tipo</label>
          <select
            id="acc-type"
            className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-sm text-neutral-900 outline-none transition-colors duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="CORRENTE">Conta Corrente</option>
            <option value="POUPANCA">Poupança</option>
            <option value="INVESTIMENTO">Investimento</option>
          </select>
        </div>

        <div className="sm:w-32">
          <label htmlFor="acc-balance" className="mb-1 block text-sm font-medium text-neutral-600">Saldo Inicial (R$)</label>
          <input
            id="acc-balance"
            type="number"
            step="0.01"
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm text-neutral-900 outline-none transition-colors duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
            value={balance}
            onChange={(e) => setBalance(Number(e.target.value))}
          />
        </div>

        <button type="submit" className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-700 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
          Adicionar
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {accounts.map(account => (
          <div key={account.id} className="flex items-center justify-between rounded-xl border border-neutral-200 border-l-4 border-l-brand-500 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
            <div>
              <h3 className="text-lg font-bold text-neutral-800">{account.name}</h3>
              <p className="text-sm text-neutral-500">{account.type}</p>
              <p className="mt-1 text-sm text-neutral-400">
                Transações vinculadas: {account._count?.transactions || 0}
              </p>
            </div>

            <div className="flex flex-col items-end text-right">
              <span className="mb-2 text-xl font-bold tabular-nums text-neutral-800">
                R$ {Number(account.balance).toFixed(2)}
              </span>
              <button
                onClick={() => handleDelete(account.id)}
                className="rounded text-sm font-semibold text-danger-500 transition-colors hover:text-danger-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 focus-visible:ring-offset-1"
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
