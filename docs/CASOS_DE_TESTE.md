# 🧪 Documentação de Casos de Teste — FinanceFlow

Estratégia de testes em **três níveis** (pirâmide de testes), com relatórios de cobertura
e análise estática. Veja também [CASOS_DE_USO.md](./CASOS_DE_USO.md),
[RELATORIO_COBERTURA.md](./RELATORIO_COBERTURA.md) e [RELATORIO_ANALISE_ESTATICA.md](./RELATORIO_ANALISE_ESTATICA.md).

## Resumo da suíte

| Nível | Ferramenta | Local | Qtd. testes |
|-------|------------|-------|-------------|
| Unitário (back-end) | Jest + ts-jest (mocks) | `backend/tests/unit` | 59 |
| Integração (back-end) | Jest + Supertest + PostgreSQL | `backend/tests/integration` | 20 |
| Unitário/Componente (front-end) | Vitest + Testing Library | `frontend/src/**/*.test.tsx` | 42 |
| End-to-End | Playwright (Chromium) | `frontend/e2e` | 5 |
| **Total** | | | **126** |

## Como executar

```bash
# Back-end (unit + integração + cobertura) — requer Docker/Postgres no ar
cd backend && npm test

# Front-end (unit/componente + cobertura)
cd frontend && npm run test:coverage

# End-to-End (requer back-end na 3001 + banco semeado)
cd frontend && npm run test:e2e
```

---

## 1. Testes Unitários — Back-end (`backend/tests/unit`)

| TC | Objetivo | Técnica | Resultado esperado | UC |
|----|----------|---------|--------------------|----|
| TC-UNB-01 | `UserService.getUserByEmail` busca por e-mail | Mock Prisma | Retorna usuário | UC01 |
| TC-UNB-02 | `UserService.createUser` cria com hash | Mock Prisma + bcrypt | Senha criptografada | UC02 |
| TC-UNB-03 | `createUser` bloqueia e-mail duplicado | Mock Prisma | Lança erro | UC02 |
| TC-UNB-04 | `createUser` sem senha usa hash vazio | Mock Prisma | Não chama bcrypt | UC02 |
| TC-UNB-05 | `getAllUsers` lista usuários | Mock Prisma | Lista retornada | UC14 |
| TC-UNB-06 | `updateUser` atualiza nome/role | Mock Prisma | Role alterado | UC14 |
| TC-UNB-07 | `deleteUser` exclui em cascata | Mock Prisma | Transações/contas/usuário removidos | UC15 |
| TC-UNB-08 | `AccountService.createAccount` usa saldo informado | Mock Prisma | Conta criada | UC09 |
| TC-UNB-09 | `createAccount` default saldo 0 | Mock Prisma | balance = 0 | UC09 |
| TC-UNB-10 | `getAccountsByUser` filtra por usuário | Mock Prisma | Lista do usuário | UC10 |
| TC-UNB-11 | `updateAccount` autoriza dono | Mock Prisma | Conta atualizada | UC11 |
| TC-UNB-12 | `updateAccount` nega conta de terceiro | Mock Prisma | Lança "acesso negado" | UC11 |
| TC-UNB-13 | `deleteAccount` exclui sem transações | Mock Prisma | Conta removida | UC12 |
| TC-UNB-14 | `deleteAccount` bloqueia com transações | Mock Prisma | Lança "Exclusão bloqueada" | UC12 |
| TC-UNB-15 | `deleteAccount` conta inexistente | Mock Prisma | Lança "não encontrada" | UC12 |
| TC-UNB-16 | `TransactionService.createTransaction` INCOME incrementa saldo | Mock Prisma | `increment: +valor` | UC06 |
| TC-UNB-17 | `createTransaction` EXPENSE decrementa saldo | Mock Prisma | `increment: -valor` | UC06 |
| TC-UNB-18 | `createTransaction` retorna transação | Mock Prisma | Objeto criado | UC06 |
| TC-UNB-19 | `getTransactionsByUser` filtra por conta do usuário | Mock Prisma | Where correto | UC05 |
| TC-UNB-20 | `updateTransaction` / `deleteTransaction` | Mock Prisma | Prisma chamado | UC07/08 |
| TC-UNB-21..33 | `UserController` login/create/list/update/delete (incl. 400/401/500) | Mock Service + jwt/bcrypt | Status HTTP corretos | UC01/02/14/15 |
| TC-UNB-34..41 | `AccountController` create/list/update/delete (incl. 400) | Mock Service | Status HTTP corretos | UC09-12 |
| TC-UNB-42..48 | `TransactionController` create/list/update/delete (incl. 400/500) | Mock Service | Status HTTP corretos | UC06-08 |
| TC-UNB-49..51 | `authMiddleware`: sem token / inválido / válido | Mock jwt | 401 / 401 / `next()` | Segurança |
| TC-UNB-52..53 | `brasilApiService`: sucesso (≤20) e falha | Mock axios | Lista filtrada / erro amigável | UC13 |

## 2. Testes de Integração — Back-end (`backend/tests/integration`)

| TC | Suíte | Objetivo | Resultado esperado | UC |
|----|-------|----------|--------------------|----|
| TC-INT-TRX-01 | Transações | Criar transação válida | HTTP 201 + id | UC06 |
| TC-INT-TRX-02 | Transações | Dados inválidos | HTTP 400 | UC06 |
| TC-INT-TRX-03 | Transações | Acesso sem token | HTTP 401 | Segurança |
| TC-INT-TRX-04 | Transações | Listar | HTTP 200 + array | UC05 |
| TC-INT-TRX-05 | Transações | Atualizar valor | HTTP 200 + amount=240 | UC07 |
| TC-INT-TRX-06 | Transações | Excluir | HTTP 200 | UC08 |
| TC-INT-ACC-01 | Contas | Acesso sem token | HTTP 401 | Segurança |
| TC-INT-ACC-02 | Contas | Criar conta | HTTP 201 + id | UC09 |
| TC-INT-ACC-03 | Contas | Criar sem nome/tipo | HTTP 400 | UC09 |
| TC-INT-ACC-04 | Contas | Listar | HTTP 200 + contém a conta | UC10 |
| TC-INT-ACC-05 | Contas | Atualizar nome | HTTP 200 | UC11 |
| TC-INT-ACC-06 | Contas | Bloquear exclusão com transações | HTTP 400 (regra UC12) | UC12 |
| TC-INT-ACC-07 | Contas | Excluir conta vazia | HTTP 200 | UC12 |
| TC-INT-USR-01 | Usuários | Criar admin | HTTP 201 + role ADMIN | UC02/15 |
| TC-INT-USR-02 | Usuários | Bloquear duplicado | HTTP 400 | UC02 |
| TC-INT-USR-03 | Usuários | Login retorna token | HTTP 200 + token | UC01 |
| TC-INT-USR-04 | Usuários | Login senha incorreta | HTTP 401 | UC01 |
| TC-INT-USR-05 | Usuários | Listar usuários | HTTP 200 + array | UC14 |
| TC-INT-USR-06 | Usuários | Atualizar nome/role | HTTP 200 | UC14 |
| TC-INT-USR-07 | Usuários | Exclusão em cascata | HTTP 200 | UC15 |

## 3. Testes de Componente/Unitário — Front-end (`frontend/src`)

| TC | Arquivo | Objetivo | UC |
|----|---------|----------|----|
| TC-FE-SVC-01..07 | `accountService.test.ts` | getBanks/create/list/delete + erros | UC09/10/12/13 |
| TC-FE-SVC-08..15 | `transactionService.test.ts` | get/create/update/delete + erros | UC05-08 |
| TC-FE-SVC-16..17 | `userService.test.ts` | registerUser sucesso/erro | UC02 |
| TC-FE-LOGIN-01..05 | `Login.test.tsx` | render, login ok, erro, acesso rápido, navegação | UC01 |
| TC-FE-REG-01..04 | `Register.test.tsx` | render, cadastro ok, erro, navegação | UC02 |
| TC-FE-DASH-01..07 | `Dashboard.test.tsx` | saldo/extrato, criar, excluir, editar, cancelar, vincular conta | UC04-09 |
| TC-FE-ACC-01..03 | `AccountManager.test.tsx` | listar, criar, excluir conta | UC09/10/12 |
| TC-FE-ADM-01..03 | `AdminPanel.test.tsx` | listar usuários, criar admin, editar | UC14/15 |
| TC-FE-APP-01..04 | `App.test.tsx` | login inicial, navegação, abas, logout | UC03 |

## 4. Testes End-to-End (`frontend/e2e/financeflow.spec.ts`)

| TC | Objetivo | Pré-requisito | UC |
|----|----------|---------------|----|
| E2E-01 | Tela de login renderiza campos | — | UC01 |
| E2E-02 | Navegação login ↔ cadastro | — | UC02 |
| E2E-03 | Login de usuário comum → Dashboard | Back-end + seed | UC01/04 |
| E2E-04 | Login de admin → Painel Administrativo | Back-end + seed | UC01/14 |
| E2E-05 | Usuário acessa a tela "Minhas Contas" | Back-end + seed | UC10 |

## Estratégia adotada

- **Pirâmide de testes:** base larga de testes unitários (rápidos, isolados com mocks),
  camada intermediária de integração (HTTP real + banco PostgreSQL via Supertest) e topo
  enxuto de testes E2E (navegador real via Playwright).
- **Testes negativos:** validações de erro (400), autenticação (401) e regras de negócio
  (bloqueio de exclusão de conta com transações).
- **Reprodutibilidade:** os testes de integração criam seus próprios usuários/contas
  (e-mails dinâmicos) e fazem teardown, podendo ser re-executados em sequência.
