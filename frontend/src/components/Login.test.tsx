import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';

describe('<Login />', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renderiza os campos de e-mail, senha e o botão Entrar', () => {
    render(<Login onLoginSuccess={vi.fn()} onNavigateToRegister={vi.fn()} />);
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('faz login com sucesso, guarda o token e chama onLoginSuccess', async () => {
    const onLoginSuccess = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'jwt-token', user: { id: 1, name: 'Ana', role: 'USER' } }),
    }) as any;

    render(<Login onLoginSuccess={onLoginSuccess} onNavigateToRegister={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ana@x.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledWith(1, 'Ana', 'USER'));
    expect(localStorage.getItem('token')).toBe('jwt-token');
  });

  it('exibe mensagem de erro quando o login falha', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'E-mail ou senha inválidos.' }),
    }) as any;

    render(<Login onLoginSuccess={vi.fn()} onNavigateToRegister={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'x@x.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'errada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('E-mail ou senha inválidos.');
  });

  it('botão de acesso rápido dispara login com as credenciais do usuário demo', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 't', user: { id: 1, name: 'Jadão', role: 'USER' } }),
    });
    global.fetch = fetchMock as any;

    render(<Login onLoginSuccess={vi.fn()} onNavigateToRegister={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Jadão o Liso/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse((fetchMock.mock.calls[0][1] as any).body);
    expect(body.email).toBe('jadao@gmail.com');
  });

  it('aciona a navegação para o cadastro', () => {
    const onNavigateToRegister = vi.fn();
    render(<Login onLoginSuccess={vi.fn()} onNavigateToRegister={onNavigateToRegister} />);
    fireEvent.click(screen.getByRole('button', { name: /Cadastre-se aqui/i }));
    expect(onNavigateToRegister).toHaveBeenCalled();
  });
});
