import { useState } from 'react';
import { creditCardService } from '../services/creditCardService';

interface CreditCardManagerProps {
  cards: any[];
  onUpdate: () => void;
}

export default function CreditCardManager({ cards, onUpdate }: CreditCardManagerProps) {
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState('25');
  const [dueDay, setDueDay] = useState('5');

  const [editingCardId, setEditingCardId] = useState<number | null>(null);

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = { name, limitAmount: Number(limit), closingDay: Number(closingDay), dueDay: Number(dueDay) };

    try {
      if (editingCardId) {
        await creditCardService.updateCard(editingCardId, payload);
        setEditingCardId(null);
      } else {
        await creditCardService.createCard(payload);
      }
      setName(''); setLimit(''); setClosingDay('25'); setDueDay('5');
      
      onUpdate();
    } catch (err: any) { setError(err.message); }
  };

  const handleEditClick = (card: any) => {
    setEditingCardId(card.id);
    setName(card.name);
    setLimit(card.limitAmount.toString());
    setClosingDay(card.closingDay.toString());
    setDueDay(card.dueDay.toString());
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir este cartão?')) return;
    try {
      setError('');
      await creditCardService.deleteCard(id);
      
      onUpdate();
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card md:col-span-3">
      <h2 className="mb-6 text-xl font-bold text-neutral-800">💳 Gestão de Cartões de Crédito</h2>

      {error && <div className="mb-4 rounded bg-danger-50 p-3 font-semibold text-danger-700">{error}</div>}

      <form onSubmit={handleSaveCard} className={`mb-8 grid grid-cols-1 items-end gap-4 rounded-lg border p-5 transition-all md:grid-cols-5 ${editingCardId ? 'border-warning-400 bg-warning-50/20' : 'border-neutral-200 bg-neutral-50'}`}>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Apelido do Cartão</label>
          <input required type="text" placeholder="Ex: Nubank Roxinho" className="w-full rounded-lg border p-2 text-sm outline-none focus:border-brand-500" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Limite (R$)</label>
          <input required type="number" step="0.01" className="w-full rounded-lg border p-2 text-sm outline-none focus:border-brand-500" value={limit} onChange={e => setLimit(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Dia Fechamento</label>
          <input required type="number" min="1" max="31" className="w-full rounded-lg border p-2 text-sm outline-none focus:border-brand-500" value={closingDay} onChange={e => setClosingDay(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Dia Vencimento</label>
          <input required type="number" min="1" max="31" className="w-full rounded-lg border p-2 text-sm outline-none focus:border-brand-500" value={dueDay} onChange={e => setDueDay(e.target.value)} />
        </div>
        <div className="mt-2 flex justify-end gap-2 md:col-span-5">
          {editingCardId && <button type="button" onClick={() => { setEditingCardId(null); setName(''); setLimit(''); }} className="rounded bg-neutral-300 px-4 py-2 font-semibold text-neutral-700 hover:bg-neutral-400">Cancelar</button>}
          <button type="submit" className={`rounded px-6 py-2 font-semibold text-white transition ${editingCardId ? 'bg-warning-500 hover:bg-warning-600' : 'bg-neutral-800 hover:bg-neutral-900'}`}>
            {editingCardId ? 'Salvar Alterações' : '+ Adicionar Cartão'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(card => {
          const limitPercentage = (card.currentInvoice / card.limitAmount) * 100;
          return (
            <div key={card.id} className={`flex flex-col justify-between rounded-xl border-t-4 bg-white p-5 shadow-md transition-all ${editingCardId === card.id ? 'border-warning-400' : 'border-brand-500'}`}>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-neutral-800">{card.name}</h3>
                  <p className="text-xs font-medium text-neutral-500">Vence dia {card.dueDay} • Fecha dia {card.closingDay}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(card)} className="text-neutral-400 transition hover:text-warning-500">✏️</button>
                  <button onClick={() => handleDelete(card.id)} className="text-neutral-400 transition hover:text-danger-500">🗑️</button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-neutral-500">Fatura Atual</span>
                  <span className="text-2xl font-bold text-neutral-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.currentInvoice)}
                  </span>
                </div>
                
                <div className="h-2.5 w-full rounded-full bg-neutral-200">
                  <div className={`h-2.5 rounded-full ${limitPercentage > 85 ? 'bg-danger-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(limitPercentage, 100)}%` }}></div>
                </div>
                
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-success-600">Disponível: R$ {card.availableLimit.toFixed(2)}</span>
                  <span className="text-neutral-500">Limite: R$ {card.limitAmount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}