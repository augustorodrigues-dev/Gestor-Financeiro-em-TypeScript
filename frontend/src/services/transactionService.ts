const API_URL = 'http://localhost:3001/api/transactions';

export interface TransactionData {
  amount: number;
  date: string;
  description: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
}

export const transactionService = {
  getTransactions: async (userId: number = 1) => {
    try {
      const response = await fetch(`${API_URL}/user/${userId}`);
      if (!response.ok) throw new Error('Erro ao buscar transações');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  createTransaction: async (data: TransactionData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao criar transação');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};