import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GoalManager from './GoalManager';
import { goalService } from '../services/goalService';

vi.mock('../services/goalService', () => ({
  goalService: {
    getGoals: vi.fn(),
    createGoal: vi.fn(),
    updateGoal: vi.fn(),
    deleteGoal: vi.fn(),
  },
}));

const svc = goalService as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('<GoalManager />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.getGoals.mockResolvedValue([
      { id: 1, name: 'Reserva', targetAmount: 10000, currentAmount: 2500, deadline: '2026-12-31', progress: 25, completed: false },
    ]);
  });

  it('lista metas com progresso', async () => {
    render(<GoalManager />);
    expect(await screen.findByText(/Reserva/)).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('cria uma meta', async () => {
    svc.createGoal.mockResolvedValue({ id: 2 });
    render(<GoalManager />);
    await screen.findByText(/Reserva/);
    fireEvent.change(screen.getByLabelText('Objetivo'), { target: { value: 'Viagem' } });
    fireEvent.change(screen.getByLabelText('Valor Alvo (R$)'), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText('Prazo'), { target: { value: '2026-10-10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar Meta' }));
    await waitFor(() => expect(svc.createGoal).toHaveBeenCalled());
    expect(svc.createGoal.mock.calls[0][0]).toMatchObject({ name: 'Viagem', targetAmount: 5000 });
  });

  it('registra aporte via prompt', async () => {
    vi.stubGlobal('prompt', vi.fn(() => '500'));
    svc.updateGoal.mockResolvedValue({});
    render(<GoalManager />);
    await screen.findByText(/Reserva/);
    fireEvent.click(screen.getByRole('button', { name: '+ Aporte' }));
    await waitFor(() => expect(svc.updateGoal).toHaveBeenCalledWith(1, { currentAmount: 3000 }));
  });
});
