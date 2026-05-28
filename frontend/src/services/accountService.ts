import { BANCOS } from '../utils/bancos';

const API_URL = 'http://localhost:3001/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `bearer ${token}`
  };
};

export const accountService = {
  
  getBanks: async () => {
    const response = await fetch('https://brasilapi.com.br/api/banks/v1');
    const data = await response.json();
    
    const codigosPermitidos = BANCOS.map(banco => banco.code);

    if (Array.isArray(data)) {
      return data.filter((bank: any) => codigosPermitidos.includes(bank.code));
    }

    return [];
  },

  createAccount: async (accountData: { name: string; type: string; balance: number; userId: number }) => {
    const response = await fetch(`${API_URL}/accounts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar conta');
    }
    return response.json();
  },

  getUserAccounts: async () => {
    const response = await fetch(`${API_URL}/accounts`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) throw new Error('Erro ao buscar contas');
    return response.json();
  },

  deleteAccount: async (id: number) => {
    const response = await fetch(`${API_URL}/accounts/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao excluir conta');
    }
    return response.json();
  }
};