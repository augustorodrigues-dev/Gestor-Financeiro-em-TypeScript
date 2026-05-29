import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoryManager from './CategoryManager';
import { categoryService } from '../services/categoryService';

vi.mock('../services/categoryService', () => ({
  categoryService: {
    getCategories: vi.fn(),
    createCategory: vi.fn(),
    deleteCategory: vi.fn(),
  },
}));

const svc = categoryService as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('<CategoryManager />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.getCategories.mockResolvedValue([
      { id: 1, name: 'Alimentação', type: 'EXPENSE', icon: '🍔', color: '#ef4444', isDefault: true },
      { id: 2, name: 'Lazer', type: 'EXPENSE', icon: '🎮', color: '#6366f1', isDefault: false },
    ]);
  });

  it('lista categorias e oculta excluir das padrão', async () => {
    render(<CategoryManager />);
    expect(await screen.findByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('Lazer')).toBeInTheDocument();
    // só a personalizada tem botão Excluir
    expect(screen.getAllByRole('button', { name: 'Excluir' })).toHaveLength(1);
  });

  it('cria uma categoria', async () => {
    svc.createCategory.mockResolvedValue({ id: 3 });
    render(<CategoryManager />);
    await screen.findByText('Alimentação');
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Transporte' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    await waitFor(() => expect(svc.createCategory).toHaveBeenCalled());
    expect(svc.createCategory.mock.calls[0][0]).toMatchObject({ name: 'Transporte' });
  });

  it('exclui categoria personalizada', async () => {
    svc.deleteCategory.mockResolvedValue({});
    render(<CategoryManager />);
    await screen.findByText('Lazer');
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(svc.deleteCategory).toHaveBeenCalledWith(2));
  });
});
