# 📊 Relatório de Cobertura de Código — FinanceFlow

> Gerado em 2026-05-28. Meta da disciplina: **70–80%**. Resultado: **meta superada** em ambos os módulos.

A cobertura é coletada automaticamente:
- **Back-end:** Jest + ts-jest (`collectCoverageFrom` em `src/**`, exceto bootstrap). Limite mínimo (`coverageThreshold`) configurado em **70%**.
- **Front-end:** Vitest + `@vitest/coverage-v8`. Limites mínimos: statements/functions/lines **70%**, branches **60%**.

Relatórios HTML detalhados são gerados em `backend/coverage/` e `frontend/coverage/`
(execute `npm test` / `npm run test:coverage`).

---

## Back-end (Jest) — 79 testes (11 suítes)

| Métrica | Cobertura |
|---------|-----------|
| **Statements** | **97.57%** (201/206) |
| **Branches** | **97.22%** (70/72) |
| **Functions** | **100%** (38/38) |
| **Lines** | **97.39%** (187/192) |

| Camada | % Stmts | % Branch | % Funcs | % Lines |
|--------|--------:|---------:|--------:|--------:|
| controllers | 95.32 | 97.91 | 100 | 95.23 |
| middlewares | 100 | 100 | 100 | 100 |
| routes | 100 | 100 | 100 | 100 |
| services | 100 | 95 | 100 | 100 |

> Excluídos da contagem por serem bootstrap/infra: `server.ts`, `prisma.ts`, `seed.ts`.

## Front-end (Vitest + v8) — 42 testes (9 suítes)

| Métrica | Cobertura |
|---------|-----------|
| **Statements** | **86.40%** (286/331) |
| **Branches** | **75.77%** (122/161) |
| **Functions** | **82.14%** (69/84) |
| **Lines** | **88.74%** (276/311) |

| Arquivo | % Stmts | % Branch | % Funcs | % Lines |
|---------|--------:|---------:|--------:|--------:|
| App.tsx | 83.33 | 92.59 | 66.66 | 83.33 |
| components/AccountManager.tsx | 83.72 | 64.28 | 83.33 | 85.71 |
| components/AdminPanel.tsx | 71.01 | 45.00 | 75.00 | 75.80 |
| components/Dashboard.tsx | 87.62 | 80.00 | 82.60 | 90.80 |
| components/Login.tsx | 92.00 | 87.50 | 75.00 | 92.00 |
| components/Register.tsx | 95.65 | 75.00 | 100 | 95.65 |
| services/* | 100 | ~77 | 100 | 100 |

> Excluídos: `main.tsx` (bootstrap), `vite-env.d.ts`, arquivos de teste e setup.

## End-to-End (Playwright)

5 cenários executados em Chromium cobrindo o fluxo crítico do usuário e do administrador
(login, navegação, dashboard, painel admin e 5ª tela). Relatório HTML em `frontend/playwright-report/`.

## Conclusão

| Módulo | Linhas | Meta 70–80% |
|--------|-------:|:-----------:|
| Back-end | 97.39% | ✅ Superada |
| Front-end | 88.74% | ✅ Superada |
