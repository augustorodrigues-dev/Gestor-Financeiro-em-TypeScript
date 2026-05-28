import { test, expect } from '@playwright/test';

test.describe('FinanceFlow — Testes End-to-End', () => {
  test('E2E-01: exibe a tela de login com os campos principais', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();
  });

  test('E2E-02: navega entre as telas de login e cadastro', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Cadastre-se aqui/i }).click();
    await expect(page.getByLabel('Nome Completo')).toBeVisible();

    await page.getByRole('button', { name: /Faça login/i }).click();
    await expect(page.getByText('Acesso Rápido')).toBeVisible();
  });

  // Requer o back-end (porta 3001) e o banco semeado em execução.
  test('E2E-03: login de usuário comum carrega o Dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Jadão o Liso/i }).click();

    await expect(page.getByText(/Bem-vindo de volta/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Saldo Consolidado')).toBeVisible();
  });

  // Requer o back-end (porta 3001) e o banco semeado em execução.
  test('E2E-04: login de administrador abre o Painel de Administração', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Entrar como Admin/i }).click();

    await expect(page.getByText(/Painel de Administração Geral/i)).toBeVisible({ timeout: 15000 });
  });

  // Requer o back-end: cobre a navegação para a 5ª tela (Minhas Contas).
  test('E2E-05: usuário comum acessa a tela Minhas Contas', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Jadão o Liso/i }).click();
    await expect(page.getByText(/Bem-vindo de volta/i)).toBeVisible({ timeout: 15000 });

    await page.getByRole('tab', { name: 'Minhas Contas' }).first().click();
    await expect(page.getByRole('heading', { name: 'Minhas Contas' })).toBeVisible();
  });
});
