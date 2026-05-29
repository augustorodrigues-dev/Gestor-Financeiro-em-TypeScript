import { useState, useEffect } from 'react';
import { creditCardService } from '../services/creditCardService';

interface Card {
  id: number;
  name: string;
  limitAmount: string | number;
  closingDay: number;
  dueDay: number;
  used: number;
  usagePercent: number;
  critical: boolean;
}

export default function CreditCardManager() {
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');

  const load = async () => {
    try {
      const data = await creditCardService.getCards();
      setCards(Array.isArray(data) ? data : []);
    } catch (err: any) { setError(err.message); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await creditCardService.createCard({
        name,
        limitAmount: Number(limitAmount),
        closingDay: Number(closingDay),
        dueDay: Number(dueDay),
      });
      setName(''); setLimitAmount(''); setClosingDay(''); setDueDay('');
      load();
    } catch (err: any) { setError(err.message); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir este cartão? O histórico de transações será mantido.')) return;
    try { await creditCardService.deleteCard(id); load(); } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 animate-fade-in">
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-neutral-800">Cartões de Crédito</h2>

      {error && <div role="alert" className="mb-4 rounded-lg border-l-4 border-danger-400 bg-danger-50 px-4 py-3 text-danger-700">{error}</div>}

      <form onSubmit={handleCreate} className="mb-8 grid grid-cols-1 gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-card sm:grid-cols-5 sm:items-end">
        <div className="sm:col-span-2">
          <label htmlFor="cc-name" className="mb-1 block text-sm font-medium text-neutral-600">Nome do Cartão</label>
          <input id="cc-name" required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" placeholder="Ex: Nubank Roxinho" />
        </div>
        <div>
          <label htmlFor="cc-limit" className="mb-1 block text-sm font-medium text-neutral-600">Limite (R$)</label>
          <input id="cc-limit" required type="number" step="0.01" value={limitAmount} onChange={e => setLimitAmount(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm outline-none focus:border-brand-500" />
        </div>
        <div>
          <label htmlFor="cc-closing" className="mb-1 block text-sm font-medium text-neutral-600">Fechamento</label>
          <input id="cc-closing" required type="number" min="1" max="31" value={closingDay} onChange={e => setClosingDay(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm outline-none focus:border-brand-500" />
        </div>
        <div>
          <label htmlFor="cc-due" className="mb-1 block text-sm font-medium text-neutral-600">Vencimento</label>
          <input id="cc-due" required type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm outline-none focus:border-brand-500" />
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-brand-700 sm:col-span-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">Adicionar Cartão</button>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map(card => (
          <div key={card.id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-800">💳 {card.name}</h3>
                <p className="text-xs text-neutral-500">Fecha dia {card.closingDay} • vence dia {card.dueDay}</p>
              </div>
              <button onClick={() => handleDelete(card.id)} className="text-sm font-semibold text-danger-500 hover:text-danger-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500">Excluir</button>
            </div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-neutral-500">Usado: R$ {Number(card.used).toFixed(2)}</span>
              <span className="font-semibold text-neutral-700">Limite: R$ {Number(card.limitAmount).toFixed(2)}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className={`h-full rounded-full transition-all ${card.critical ? 'bg-danger-500' : 'bg-success-500'}`} style={{ width: `${Math.min(card.usagePercent, 100)}%` }} />
            </div>
            {card.critical && (
              <p role="alert" className="mt-2 text-xs font-semibold text-danger-600">⚠️ Limite crítico: {card.usagePercent}% utilizado</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
