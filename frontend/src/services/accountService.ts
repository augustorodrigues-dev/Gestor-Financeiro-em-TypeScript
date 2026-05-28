const API_URL = 'http://localhost:3001/api';

// Função auxiliar para pegar o token salvo no login e injetar no cabeçalho
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const accountService = {
  getBanks: async () => {
    const response = await fetch(`${API_URL}/banks`, {
      headers: getHeaders(),
    });
    const data = await response.json();
    return data.banks || [];
  },

  createAccount: async (accountData: { name: string; balance: number; type: string; userId: number }) => {
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

  getUserBalance: async (userId: number) => {
    const response = await fetch(`${API_URL}/balance/user/${userId}`, {
      headers: getHeaders(),
    });
    const data = await response.json();
    return data.balance;
  },

  getUserAccounts: async (userId: number) => {
    const response = await fetch(`${API_URL}/accounts/user/${userId}`, {
      headers: getHeaders(),
    });
    return response.json();
  },

  // 🚀 ADICIONE ESTE MÉTODO AQUI EMBAIXO PARA SUMIR COM O ERRO:
  deleteAccount: async (id: number) => {
    const response = await fetch(`${API_URL}/accounts/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Captura a mensagem do back-end (ex: a trava do UC03 de transações vinculadas) [cite: 7]
      throw new Error(errorData.error || 'Erro ao excluir conta');
    }

    return response.json();
  }
};