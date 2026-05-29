import { useState, useEffect } from 'react';
import { getReportSummary, getExchange } from '../services/financeService';

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// UC16 — Exporta as transações em CSV no navegador
function exportCSV(transactions: any[]) {
  const header = 'Descrição,Tipo,Valor,Data\n';
  const rows = transactions
    .map(t => `"${t.description}",${t.type},${Number(t.amount).toFixed(2)},${new Date(t.date).toLocaleDateString('pt-BR')}`)
    .join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'extrato-financeflow.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState('');

  // Câmbio (UC10)
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('BRL');
  const [amount, setAmount] = useState('1');
  const [exchange, setExchange] = useState<any>(null);

  const load = async () => {
    try {
      setSummary(await getReportSummary());
    } catch (err: any) { setError(err.message); }
  };

  useEffect(() => { load(); }, []);

  const handleExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setExchange(await getExchange(from, to, Number(amount)));
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 animate-fade-in">
      <h2 className="text-2xl font-bold tracking-tight text-neutral-800">Relatórios</h2>

      {error && <div role="alert" className="rounded-lg border-l-4 border-danger-400 bg-danger-50 px-4 py-3 text-danger-700">{error}</div>}

      {/* UC07 — Resumo financeiro */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border-l-4 border-success-500 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Receitas</p>
            <p className="mt-1 text-2xl font-bold text-success-600">{brl(summary.totalIncome)}</p>
          </div>
          <div className="rounded-xl border-l-4 border-danger-500 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Despesas</p>
            <p className="mt-1 text-2xl font-bold text-danger-600">{brl(summary.totalExpense)}</p>
          </div>
          <div className="rounded-xl border-l-4 border-brand-500 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Saldo do Período</p>
            <p className={`mt-1 text-2xl font-bold ${summary.balance >= 0 ? 'text-success-600' : 'text-danger-600'}`}>{brl(summary.balance)}</p>
          </div>
        </div>
      )}

      {summary && (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-neutral-800">Movimentações ({summary.count})</h3>
            <button onClick={() => exportCSV(summary.transactions)} className="rounded-lg bg-neutral-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 focus-visible:ring-offset-2">
              ⬇️ Exportar CSV
            </button>
          </div>
          <p className="text-sm text-neutral-500">Use "Exportar CSV" para baixar o extrato. Para PDF, utilize a impressão do navegador (Ctrl+P → Salvar como PDF).</p>
        </div>
      )}

      {/* UC10 — Câmbio */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
        <h3 className="mb-3 font-bold text-neutral-800">💱 Cotação de Moeda</h3>
        <form onSubmit={handleExchange} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:w-28">
            <label htmlFor="ex-from" className="mb-1 block text-xs font-medium text-neutral-500">De</label>
            <select id="ex-from" value={from} onChange={e => setFrom(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm outline-none focus:border-brand-500">
              <option>USD</option><option>EUR</option><option>BTC</option><option>GBP</option>
            </select>
          </div>
          <div className="sm:w-28">
            <label htmlFor="ex-to" className="mb-1 block text-xs font-medium text-neutral-500">Para</label>
            <select id="ex-to" value={to} onChange={e => setTo(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm outline-none focus:border-brand-500">
              <option>BRL</option><option>USD</option><option>EUR</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="ex-amount" className="mb-1 block text-xs font-medium text-neutral-500">Valor</label>
            <input id="ex-amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm outline-none focus:border-brand-500" />
          </div>
          <button type="submit" className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">Converter</button>
        </form>
        {exchange && (
          <p className="mt-3 text-lg font-bold text-neutral-800">
            {exchange.amount} {from} = <span className="text-brand-600">{exchange.converted} {to}</span>
            <span className="ml-2 text-xs font-normal text-neutral-400">(1 {from} = {exchange.bid} {to}{exchange.fromCache ? ' • cache' : ''})</span>
          </p>
        )}
      </div>
    </div>
  );
}
