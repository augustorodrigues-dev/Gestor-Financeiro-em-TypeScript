import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

describe('<App /> (fluxo de navegação)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('inicia na tela de login', () => {
    render(<App />);
    expect(screen.getByText('Acesso Rápido')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('navega do login para o cadastro e volta', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Cadastre-se aqui/i }));
    expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Faça login/i }));
    expect(screen.getByText('Acesso Rápido')).toBeInTheDocument();
  });

  it('após login de usuário comum, mostra o painel e permite trocar para Minhas Contas', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'jwt', user: { id: 1, name: 'Ana', role: 'USER' } }),
    }) as any;

    render(<App />);
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ana@x.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    // Aparecem as abas de navegação do usuário logado
    await waitFor(() => expect(screen.getAllByRole('tab', { name: 'Minhas Contas' }).length).toBeGreaterThan(0));
    expect(screen.getAllByRole('tab', { name: 'Painel' }).length).toBeGreaterThan(0);
  });

  it('troca para a aba Minhas Contas e faz logout', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'jwt', user: { id: 1, name: 'Ana', role: 'USER' } }),
    }) as any;

    render(<App />);
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ana@x.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(screen.getAllByRole('tab', { name: 'Minhas Contas' }).length).toBeGreaterThan(0));

    // Troca para a tela de contas
    fireEvent.click(screen.getAllByRole('tab', { name: 'Minhas Contas' })[0]);
    expect(await screen.findByText('Minhas Contas', { selector: 'h2' })).toBeInTheDocument();

    // Logout volta para o login
    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
    expect(screen.getByText('Acesso Rápido')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
