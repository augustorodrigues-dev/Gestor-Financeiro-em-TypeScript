// frontend/src/services/goalService.ts
const API_URL = 'http://localhost:3001/api/goals';

export const goalService = {
  getHeaders: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }),

  getGoals: async () => {
    const response = await fetch(API_URL, { headers: goalService.getHeaders() });
    return response.json();
  },

  createGoal: async (goalData: { name: string; targetAmount: number; deadline: string }) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: goalService.getHeaders(),
      body: JSON.stringify(goalData)
    });
    return response.json();
  },

  addProgress: async (goalId: number, currentAmount: number) => {
    const response = await fetch(`${API_URL}/${goalId}`, {
      method: 'PUT',
      headers: goalService.getHeaders(),
      body: JSON.stringify({ currentAmount })
    });
    return response.json();
  },

  deleteGoal: async (goalId: number) => {
    const response = await fetch(`${API_URL}/${goalId}`, {
      method: 'DELETE',
      headers: goalService.getHeaders()
    });
    return response.json();
  }
};