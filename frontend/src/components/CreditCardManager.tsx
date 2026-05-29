import { useState, useEffect } from 'react';
import { creditCardService } from '../services/creditCardService';

export default function CreditCardManager() {
  const [cards, setCards] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState('25');
  const [dueDay, setDueDay] = useState('5');

  const [editingCardId, setEditingCardId] = useState<number | null>(null);

  useEffect(() => { loadCards(); }, []);

  const loadCards = async () => {
    try {
      const data = await creditCardService.getCards();
      setCards(Array.isArray(data) ? data : []);
    } catch (err: any) { setError(err.message); }
  };

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
      loadCards();
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
      loadCards();
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        💳 {editingCardId ? 'Editar Cartão' : 'Meus Cartões de Crédito'}
      </h2>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded font-semibold">{error}</div>}

      {}
      <form onSubmit={handleSaveCard} className={`bg-white p-5 rounded-lg shadow border transition-all ${editingCardId ? 'border-amber-400 bg-amber-50/20' : 'border-gray-200'} grid grid-cols-1 md:grid-cols-5 gap-4 items-end`}>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">Apelido do Cartão</label>
          <input required type="text" placeholder="Ex: Nubank Roxinho" className="w-full border p-2 rounded outline-none focus:border-blue-500" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Limite (R$)</label>
          <input required type="number" step="0.01" className="w-full border p-2 rounded outline-none focus:border-blue-500" value={limit} onChange={e => setLimit(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Dia Fechamento</label>
          <input required type="number" min="1" max="31" className="w-full border p-2 rounded outline-none focus:border-blue-500" value={closingDay} onChange={e => setClosingDay(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Dia Vencimento</label>
          <input required type="number" min="1" max="31" className="w-full border p-2 rounded outline-none focus:border-blue-500" value={dueDay} onChange={e => setDueDay(e.target.value)} />
        </div>
        <div className="md:col-span-5 flex gap-2 justify-end mt-2">
          {editingCardId && <button type="button" onClick={() => { setEditingCardId(null); setName(''); setLimit(''); }} className="bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-400">Cancelar</button>}
          <button type="submit" className={`px-6 py-2 rounded text-white font-semibold transition ${editingCardId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {editingCardId ? 'Salvar Alterações' : '+ Adicionar Cartão'}
          </button>
        </div>
      </form>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {cards.map(card => {
          const limitPercentage = (card.currentInvoice / card.limitAmount) * 100;
          return (
            <div key={card.id} className={`bg-white rounded-xl shadow-md border-t-4 p-5 flex flex-col justify-between transition-all ${editingCardId === card.id ? 'border-amber-400' : 'border-purple-500'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-extrabold text-xl text-gray-800">{card.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">Vence dia {card.dueDay} • Fecha dia {card.closingDay}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(card)} className="text-gray-400 hover:text-amber-500 transition">✏️</button>
                  <button onClick={() => handleDelete(card.id)} className="text-gray-400 hover:text-red-500 transition">🗑️</button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-gray-500">Fatura Atual</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.currentInvoice)}
                  </span>
                </div>
                
                {}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${limitPercentage > 85 ? 'bg-red-500' : 'bg-purple-600'}`} style={{ width: `${Math.min(limitPercentage, 100)}%` }}></div>
                </div>
                
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-green-600">Disponível: R$ {card.availableLimit.toFixed(2)}</span>
                  <span className="text-gray-500">Limite Total: R$ {card.limitAmount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}