const API_URL = 'http://localhost:3001/api/cards';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const creditCardService = {
  getCards: async () => {
    const res = await fetch(API_URL, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao buscar cartões.');
    return res.json();
  },

  createCard: async (data: { name: string; limitAmount: number; closingDay: number; dueDay: number }) => {
    const res = await fetch(API_URL, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error((await res.json()).error || 'Erro ao criar cartão.');
    return res.json();
  },

  updateCard: async (id: number, data: any) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error((await res.json()).error || 'Erro ao atualizar cartão.');
    return res.json();
  },

  deleteCard: async (id: number) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || 'Erro ao excluir cartão.');
    return res.json();
  },
};
