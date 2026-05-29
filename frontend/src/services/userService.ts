const API_URL = 'http://localhost:3001/api';

export const registerUser = async (userData: { name: string; email: string; password: string }) => {
  const response = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro ao realizar o cadastro.');
  }

  return data;
};

// UC11 — Editar Perfil
export const updateProfile = async (data: { name?: string; email?: string; password?: string }) => {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Erro ao atualizar perfil.');
  return result;
};

// UC18 — Solicitar recuperação de senha
export const forgotPassword = async (email: string) => {
  const response = await fetch(`${API_URL}/users/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Erro ao solicitar recuperação.');
  return result;
};

// UC18 — Redefinir senha com token
export const resetPassword = async (token: string, password: string) => {
  const response = await fetch(`${API_URL}/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Erro ao redefinir senha.');
  return result;
};