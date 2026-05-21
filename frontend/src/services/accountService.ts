const API_URL = 'http://localhost:3001/api';

export const getBanks = async () => {
  const response = await fetch(`${API_URL}/banks`);
  const data = await response.json();
  return data.banks || [];
};

export const createAccount = async (accountData: { name: string; balance: number; type: string; userId: number }) => {
  const response = await fetch(`${API_URL}/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(accountData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao criar conta');
  }

  return response.json();
};

export const getUserBalance = async (userId: number) => {
  const response = await fetch(`${API_URL}/balance/user/${userId}`);
  const data = await response.json();
  return data.balance;
};

export const getUserAccounts = async (userId: number) => {
  const response = await fetch(`${API_URL}/accounts/user/${userId}`);
  return response.json();
};