const API_URL = 'http://localhost:3001/api/credit-cards';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const creditCardService = {
  getCards: async () => {
    const response = await fetch(API_URL, { headers: getHeaders() });
    if (!response.ok) throw new Error('Erro ao buscar cartões');
    return response.json();
  },

  createCard: async (data: any) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar cartão');
    }
    return response.json();
  },

  updateCard: async (id: number, data: any) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar cartão');
    }
    return response.json();
  },

  deleteCard: async (id: number) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao excluir cartão');
    }
    return response.json();
  }
};