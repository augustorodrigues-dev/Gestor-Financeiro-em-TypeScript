# 🧪 Documentação de Casos de Teste — FinanceFlow

Estratégia em três níveis (pirâmide de testes) + cobertura + análise estática.
Ver [CASOS_DE_USO.md](./CASOS_DE_USO.md), [RELATORIO_COBERTURA.md](./RELATORIO_COBERTURA.md)
e [RELATORIO_ANALISE_ESTATICA.md](./RELATORIO_ANALISE_ESTATICA.md).

## Resumo da suíte (208 testes)

| Nível | Ferramenta | Local | Qtd. |
|-------|------------|-------|-----:|
| Unitário (back-end) | Jest + mocks | `backend/tests/unit` | 93 |
| Integração (back-end) | Jest + Supertest + PostgreSQL | `backend/tests/integration` | 29 |
| Unitário/Componente (front-end) | Vitest + Testing Library | `frontend/src/**/*.test.tsx` | 80 |
| End-to-End | Cypress | `frontend/cypress/e2e` | 6 |

## Como executar
```bash
cd backend  && npm test               # unit + integração + cobertura (requer Postgres)
cd backend  && npm run lint           # análise estática
cd frontend && npm run test:coverage  # componente/unit + cobertura
cd frontend && npm run lint
cd frontend && npm run test:e2e       # E2E Cypress (sobe o front; requer back-end + seed)
```

---

## 1. Casos de teste oficiais do grupo (mapeados aos testes automatizados)

### CRUD de Transações
| TC | Objetivo | Esperado | Automação |
|----|----------|----------|-----------|
| TC-TRX-01 | Criar transação válida | 201 + impacto no saldo | `transactions.integration` #1 + `TransactionService.test` |
| TC-TRX-02 | Barrar payload inválido | 400 | `transactions.integration` #2 + `TransactionController.test` |
| TC-TRX-03 | Listar transações do usuário | 200 + array | `transactions.integration` #4 |
| TC-TRX-04 | Atualizar valor | 200 + 240.00 | `transactions.integration` #5 |
| TC-TRX-05 | Excluir registro (teardown) | 200 | `transactions.integration` #6 |

### CRUD de Usuários / Acessos
| TC | Objetivo | Esperado | Automação |
|----|----------|----------|-----------|
| TC-USR-01 | Criar administrador | 201 + role ADMIN | `users.integration` #1 |
| TC-USR-02 | Barrar e-mail duplicado | 400 | `users.integration` #2 |
| TC-USR-03 | Listar usuários | 200 + array | `users.integration` #5 |
| TC-USR-04 | Editar nível de acesso | 200 | `users.integration` #6 |
| TC-USR-05 | Exclusão em cascata | 200 | `users.integration` #7 |

## 2. Testes Unitários — Back-end (`tests/unit`, 93)
Serviços e controllers com Prisma/serviços mockados:
`UserService`, `AccountService`, `TransactionService`, `CategoryService`, `CreditCardService`,
`GoalService`, `ReportService`, `exchangeService`, `brasilApiService`, `authMiddleware`, e os
controllers de User/Account/Transaction. Cobrem caminhos felizes, validações (400), auth (401),
erros (500) e regras de negócio (bloqueio de exclusão, limite crítico de cartão, progresso de meta).

## 3. Testes de Integração — Back-end (`tests/integration`, 29)
- `transactions.integration` — CRUD + 401 sem token.
- `accounts.integration` — CRUD + bloqueio de exclusão com transações (UC03).
- `users.integration` — cadastro, login, duplicado, edição, exclusão em cascata.
- `domain.integration` — Categorias (UC05), Cartões (UC08), Metas (UC09), Perfil (UC11),
  Recuperação de senha (UC18) e Relatório (UC07), incluindo casos negativos (400/401).

## 4. Testes de Componente — Front-end (`src`, 80)
Telas: `Login`, `Register`, `Dashboard` (incl. filtro UC13 e alerta UC19), `AccountManager`,
`AdminPanel`, `CategoryManager`, `CreditCardManager` (alerta UC20), `GoalManager`, `Profile`,
`Reports` (UC07/UC10/UC16), `ForgotPassword` (UC18) e `App` (navegação/logout UC15).
Services: account, transaction, user, category, creditCard, goal, finance.

## 5. Testes End-to-End — Cypress (`cypress/e2e`, 6)
| TC | Objetivo | UC |
|----|----------|----|
| E2E-01 | Tela de login renderiza campos | UC01 |
| E2E-02 | Navegação login ↔ cadastro | UC02 |
| E2E-03 | Login de usuário → Dashboard | UC01/04/06 |
| E2E-04 | Login de admin → Painel | UC01/14 |
| E2E-05 | Navegação Contas/Categorias/Cartões/Metas/Relatórios | UC03/05/08/09/07 |
| E2E-06 | Edição de perfil | UC11 |

## Estratégia
Base larga de unitários (rápidos, isolados), camada de integração (HTTP + PostgreSQL real),
topo enxuto de E2E (navegador). Inclui testes negativos (400/401) e regras de negócio.
Os testes de integração criam seus próprios dados (e-mails dinâmicos) e fazem teardown,
sendo reproduzíveis em sequência.
