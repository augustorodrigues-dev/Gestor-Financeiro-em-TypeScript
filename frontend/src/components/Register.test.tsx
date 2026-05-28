import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from './Register';
import { registerUser } from '../services/userService';

vi.mock('../services/userService', () => ({ registerUser: vi.fn() }));

const registerMock = registerUser as unknown as ReturnType<typeof vi.fn>;

describe('<Register />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renderiza os campos de cadastro', () => {
    render(<Register onNavigateToLogin={vi.fn()} onRegisterSuccess={vi.fn()} />);
    expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
  });

  it('cadastra com sucesso, guarda token e chama onRegisterSuccess', async () => {
    const onRegisterSuccess = vi.fn();
    registerMock.mockResolvedValue({ token: 'jwt', user: { id: 9, name: 'Novo', role: 'USER' } });

    render(<Register onNavigateToLogin={vi.fn()} onRegisterSuccess={onRegisterSuccess} />);
    fireEvent.change(screen.getByLabelText('Nome Completo'), { target: { value: 'Novo' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'novo@x.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /Cadastrar e Entrar/i }));

    await waitFor(() => expect(onRegisterSuccess).toHaveBeenCalledWith(9, 'Novo', 'USER'));
    expect(localStorage.getItem('token')).toBe('jwt');
  });

  it('mostra erro quando o cadastro falha', async () => {
    registerMock.mockRejectedValue(new Error('E-mail já cadastrado'));

    render(<Register onNavigateToLogin={vi.fn()} onRegisterSuccess={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Nome Completo'), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'x@x.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /Cadastrar e Entrar/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('E-mail já cadastrado');
  });

  it('aciona a navegação para o login', () => {
    const onNavigateToLogin = vi.fn();
    render(<Register onNavigateToLogin={onNavigateToLogin} onRegisterSuccess={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Faça login/i }));
    expect(onNavigateToLogin).toHaveBeenCalled();
  });
});
