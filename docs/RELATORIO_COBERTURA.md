# 📊 Relatório de Cobertura de Código — FinanceFlow

> Meta da disciplina: **70–80%**. Resultado: **meta superada** em ambos os módulos.

Cobertura coletada automaticamente:
- **Back-end:** Jest + ts-jest (`coverageThreshold` mínimo 70%). Relatórios: `text`, `lcov`, `html`, `json-summary`.
- **Front-end:** Vitest + `@vitest/coverage-v8` (thresholds: stmts/funcs/lines 70%, branches 60%).

Relatórios HTML em `backend/coverage/` e `frontend/coverage/`. Os arquivos `lcov.info`
alimentam o SonarQube (ver `sonar-project.properties`).

## Resumo da suíte de testes

| Nível | Ferramenta | Qtd. |
|-------|------------|-----:|
| Unitário (back-end) | Jest (mocks de Prisma/serviços) | 93 |
| Integração (back-end) | Jest + Supertest + PostgreSQL | 29 |
| Unitário/Componente (front-end) | Vitest + Testing Library | 80 |
| End-to-End | Cypress (6 specs) | 6 |
| **Total automatizado** | | **208** |

## Back-end (Jest) — 122 testes / 17 suítes

| Métrica | Cobertura |
|---------|-----------|
| **Statements** | **87.87%** (442/503) |
| **Branches** | **79.00%** (143/181) |
| **Functions** | **92.55%** (87/94) |
| **Lines** | **89.86%** (399/444) |

Cobre controllers, services (Account, Transaction, User, Category, CreditCard, Goal, Report,
exchange, brasilApi) e middleware de autenticação. Excluídos: `server.ts`, `prisma.ts`, `seed.ts`.

## Front-end (Vitest + v8) — 80 testes / 16 arquivos

| Métrica | Cobertura |
|---------|-----------|
| **Statements** | **85.30%** (563/660) |
| **Branches** | **64.83%** (201/310) |
| **Functions** | **84.02%** (142/169) |
| **Lines** | **89.34%** (520/582) |

Cobre as 10 telas/componentes e os 6 services do front-end. Excluídos: `main.tsx`, setup e testes.

## End-to-End (Cypress)
6 cenários cobrindo login (usuário/admin), navegação pelas telas, dashboard, perfil e fluxos
críticos. Execução: `npm run test:e2e` (sobe o front e roda o Cypress headless).

## Conclusão
| Módulo | Linhas | Meta 70–80% |
|--------|-------:|:-----------:|
| Back-end | 89.86% | ✅ Superada |
| Front-end | 89.34% | ✅ Superada |
