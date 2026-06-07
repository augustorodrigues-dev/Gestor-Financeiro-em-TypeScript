# FinanceFlow 💸 — Documentação dos Casos de Teste

> Documento 03 de 05. Veja o [índice da documentação](./README.md).
>
> Cada **caso de uso** (ver [02-CASOS-DE-USO.md](./02-CASOS-DE-USO.md)) possui um ou mais
> **casos de teste** documentados no padrão: *identificador, objetivo, pré-condições,
> dados de entrada, passos de execução, resultado esperado, resultado obtido e status.*
>
> **Status global:** ✅ **119 testes automatizados aprovados** — 39 unitários de
> back-end (Jest) + 39 unitários de front-end (Vitest) + 41 de integração (Supertest) —
> além de **5 fluxos E2E** (Cypress, executados e aprovados). Os resultados abaixo foram
> **coletados em execução real** (`npm run test:coverage`).

## 1. Convenções

- **Níveis:** `U` = Unitário (Jest, mock do Prisma) · `I` = Integração (Jest + Supertest + SQLite local) · `E2E` = Cypress (navegador).
- **Status:** ✅ Aprovado · ❌ Reprovado.
- A coluna *Arquivo de teste* aponta o teste automatizado que **comprova** cada caso.

## 2. Matriz de Rastreabilidade (Caso de Uso → Casos de Teste)

| Caso de Uso | Casos de Teste | Nível | Arquivo de teste automatizado | Status |
| ----------- | -------------- | ----- | ----------------------------- | ------ |
| UC01 — Cadastrar-se | TC-AUTH-01, TC-AUTH-02 | U, I, E2E | `UserService.test.ts`, `users.integration.test.ts`, `transaction.cy.ts` | ✅ |
| UC02 — Login | TC-AUTH-03, TC-AUTH-04, TC-AUTH-05 | I, E2E | `validation.integration.test.ts`, `creditCard.cy.ts` | ✅ |
| UC03 — Logout | TC-AUTH-06 | E2E | (manual/`App.tsx`) | ✅ |
| UC04 — Cadastrar conta (Brasil API) | TC-CONTA-01, TC-CONTA-02, TC-BANK-01, TC-BANK-02 | U, I | `AccountService.test.ts`, `accounts.integration.test.ts`, `BrasilApiService.test.ts`, `server.integration.test.ts` | ✅ |
| UC05 — Listar contas / saldo | TC-CONTA-03, TC-SALDO-01, TC-SALDO-02 | U, I | `accounts.integration.test.ts`, `server.integration.test.ts` | ✅ |
| UC06 — Editar conta | TC-CONTA-04, TC-CONTA-05 | U, I | `AccountService.test.ts`, `accounts.integration.test.ts` | ✅ |
| UC07 — Excluir conta | TC-CONTA-06, TC-CONTA-07 | U, I | `AccountService.test.ts`, `accounts.integration.test.ts` | ✅ |
| UC08 — Registrar transação | TC-TRX-01, TC-TRX-02, TC-TRX-03 | U, I, E2E | `TransactionService.test.ts`, `transactions.integration.test.ts`, `transaction.cy.ts` | ✅ |
| UC09 — Listar extrato | TC-TRX-04 | I | `transactions.integration.test.ts` | ✅ |
| UC10 — Editar transação | TC-TRX-05 | I | `transactions.integration.test.ts` | ✅ |
| UC11 — Excluir transação | TC-TRX-06, TC-TRX-07 | U, I | `TransactionService.test.ts`, `transactions.integration.test.ts` | ✅ |
| UC12 — Cadastrar cartão | TC-CARD-01 | U, I, E2E | `CreditCardService.test.ts`, `creditCard.integration.test.ts`, `creditCard.cy.ts` | ✅ |
| UC13 — Fatura / limite | TC-CARD-02 | U, I | `CreditCardService.test.ts`, `creditCard.integration.test.ts` | ✅ |
| UC14 — Excluir cartão | TC-CARD-03, TC-CARD-04 | U | `CreditCardService.test.ts` | ✅ |
| UC15 — Categorias | TC-CAT-01, TC-CAT-02, TC-CAT-03 | U, I, E2E | `CategoryService.test.ts`, `category.integration.test.ts`, `validation.integration.test.ts`, `categories.cy.ts` | ✅ |
| UC16 — Criar/acompanhar meta | TC-META-01, TC-META-02, TC-META-03 | U, I, E2E | `GoalService.test.ts`, `goals.integration.test.ts`, `goals.cy.ts` | ✅ |
| UC17 — Aporte em meta | TC-META-04, TC-META-05 | U, I, E2E | `GoalService.test.ts`, `goals.integration.test.ts`, `goals.cy.ts` | ✅ |
| UC18 — Administrar usuários | TC-ADMIN-01, TC-ADMIN-02, TC-ADMIN-03 | U, I, E2E | `UserService.test.ts`, `users.integration.test.ts`, `users.cy.ts` | ✅ |

---

## 3. Casos de Teste Detalhados

### Autenticação (UC01–UC03)

#### TC-AUTH-01 — Bloquear cadastro com e-mail duplicado
- **Objetivo:** Garantir a regra de unicidade de e-mail no cadastro.
- **Pré-condições:** Já existe um usuário com o e-mail `alexandra@gmail.com`.
- **Dados de entrada:** `{ name: "Clone da Alexandra", email: "alexandra@gmail.com", password: "senha" }`.
- **Passos:** 1) Chamar `createUser` (U) / `POST /api/users/register` (I) com e-mail existente.
- **Resultado esperado:** Erro *“Este e-mail já está cadastrado no sistema.”*; HTTP 400 na integração; `prisma.user.create` **não** chamado.
- **Resultado obtido:** Erro lançado e HTTP 400 retornados conforme esperado.
- **Status:** ✅ Aprovado · *(UserService.test.ts #1, users.integration.test.ts #2)*

#### TC-AUTH-02 — Cadastro bem-sucedido com início de sessão
- **Objetivo:** Validar criação de usuário e emissão de token.
- **Pré-condições:** E-mail inédito.
- **Dados de entrada:** `{ name, email único, password }`.
- **Passos:** 1) `POST /api/users/register`.
- **Resultado esperado:** HTTP 201; corpo com `user.id` e `token`.
- **Resultado obtido:** HTTP 201 com `user` e `token` retornados.
- **Status:** ✅ Aprovado · *(users.integration.test.ts #1; transaction.cy.ts)*

#### TC-AUTH-03 — Login exige e-mail e senha
- **Objetivo:** Validar campos obrigatórios.
- **Dados de entrada:** `{ email: "x@x.com" }` (sem senha).
- **Passos:** 1) `POST /api/users/login`.
- **Resultado esperado:** HTTP 400.
- **Resultado obtido:** HTTP 400.
- **Status:** ✅ Aprovado · *(validation.integration.test.ts)*

#### TC-AUTH-04 — Login recusa credenciais inválidas
- **Objetivo:** Garantir rejeição de senha incorreta.
- **Pré-condições:** Usuário `jadao@gmail.com` existe.
- **Dados de entrada:** `{ email: "jadao@gmail.com", password: "senha_errada" }`.
- **Passos:** 1) `POST /api/users/login`.
- **Resultado esperado:** HTTP 401 *“E-mail ou senha inválidos.”*.
- **Resultado obtido:** HTTP 401.
- **Status:** ✅ Aprovado · *(validation.integration.test.ts)*

#### TC-AUTH-05 — Login recusa e-mail inexistente
- **Objetivo:** Garantir rejeição de e-mail não cadastrado.
- **Dados de entrada:** e-mail aleatório inexistente + senha qualquer.
- **Passos:** 1) `POST /api/users/login`.
- **Resultado esperado:** HTTP 401.
- **Resultado obtido:** HTTP 401.
- **Status:** ✅ Aprovado · *(validation.integration.test.ts)*

#### TC-AUTH-06 — Logout encerra a sessão
- **Objetivo:** Garantir que o logout limpa token e estado.
- **Pré-condições:** Sessão ativa.
- **Passos:** 1) Acionar “Sair”. 2) Verificar redirecionamento ao Login.
- **Resultado esperado:** Token removido do `localStorage`; tela de Login exibida.
- **Resultado obtido:** Sessão encerrada e Login exibido.
- **Status:** ✅ Aprovado · *(verificação manual / `App.tsx handleLogout`)*

### Contas Bancárias e Saldo (UC04–UC07)

#### TC-CONTA-01 — Criar conta com saldo padrão 0
- **Objetivo:** Validar valor-padrão de saldo quando não informado.
- **Dados de entrada:** `{ name: "Nubank", type: "CORRENTE" }`.
- **Passos:** 1) `AccountService.createAccount`.
- **Resultado esperado:** `prisma.account.create` chamado com `balance: 0`.
- **Resultado obtido:** Conforme esperado.
- **Status:** ✅ Aprovado · *(AccountService.test.ts #1)*

#### TC-CONTA-02 — Criar conta exige nome e tipo
- **Objetivo:** Validar campos obrigatórios via HTTP.
- **Dados de entrada:** `{ balance: 500 }` (sem nome/tipo) + token válido.
- **Passos:** 1) `POST /api/accounts`.
- **Resultado esperado:** HTTP 400 com `error`.
- **Resultado obtido:** HTTP 400.
- **Status:** ✅ Aprovado · *(accounts.integration.test.ts #3)*

#### TC-CONTA-03 — Listar contas exige autenticação
- **Objetivo:** Garantir proteção da rota (JWT).
- **Dados de entrada:** Requisição **sem** cabeçalho Authorization.
- **Passos:** 1) `GET /api/accounts`.
- **Resultado esperado:** HTTP 401.
- **Resultado obtido:** HTTP 401.
- **Status:** ✅ Aprovado · *(accounts.integration.test.ts #1)*

#### TC-CONTA-04 — Bloquear edição de conta de outro usuário
- **Objetivo:** Validar isolamento por proprietário.
- **Dados de entrada:** `updateAccount(1, 99, {...})` (usuário 99 não é dono).
- **Resultado esperado:** Erro *“Conta não encontrada ou acesso negado.”*; `update` não chamado.
- **Resultado obtido:** Erro lançado.
- **Status:** ✅ Aprovado · *(AccountService.test.ts #3)*

#### TC-CONTA-05 — Atualizar conta com ID inválido
- **Objetivo:** Validar parsing de ID.
- **Dados de entrada:** `PUT /api/accounts/abc`.
- **Resultado esperado:** HTTP 400.
- **Resultado obtido:** HTTP 400.
- **Status:** ✅ Aprovado · *(accounts.integration.test.ts #6)*

#### TC-CONTA-06 — Bloquear exclusão de conta com transações
- **Objetivo:** **Regra de negócio** — preservar integridade.
- **Dados de entrada:** Conta com `_count.transactions = 5`.
- **Resultado esperado:** Erro *“Exclusão bloqueada…”*; `delete` não chamado.
- **Resultado obtido:** Erro lançado.
- **Status:** ✅ Aprovado · *(AccountService.test.ts #6)*

#### TC-CONTA-07 — Excluir conta sem transações
- **Objetivo:** Validar exclusão permitida.
- **Dados de entrada:** Conta com `_count.transactions = 0`.
- **Resultado esperado:** `prisma.account.delete` chamado; HTTP 200 na integração.
- **Resultado obtido:** Conforme esperado.
- **Status:** ✅ Aprovado · *(AccountService.test.ts #7, accounts.integration.test.ts #7)*

#### TC-SALDO-01 — Calcular saldo consolidado
- **Objetivo:** Validar soma dos saldos das contas.
- **Pré-condições:** Usuário com duas contas (R$ 100 + R$ 50).
- **Passos:** 1) `GET /api/balance/user/:id`.
- **Resultado esperado:** HTTP 200, `balance = 150`.
- **Resultado obtido:** `balance = 150`.
- **Status:** ✅ Aprovado · *(server.integration.test.ts #1)*

#### TC-SALDO-02 — Saldo com ID inválido
- **Objetivo:** Validar tratamento de ID não numérico.
- **Dados de entrada:** `GET /api/balance/user/abc`.
- **Resultado esperado:** HTTP 400 com `error`.
- **Resultado obtido:** HTTP 400.
- **Status:** ✅ Aprovado · *(server.integration.test.ts #2)*

### Integração com Brasil API (UC04)

#### TC-BANK-01 — Filtrar e limitar instituições
- **Objetivo:** Validar filtro (código + nome) e limite de 20.
- **Dados de entrada:** Lista com 30 itens válidos + 2 inválidos (mock do axios).
- **Resultado esperado:** Retorno com 20 itens, todos com `code` e `name`.
- **Resultado obtido:** 20 itens válidos.
- **Status:** ✅ Aprovado · *(BrasilApiService.test.ts #1)*

#### TC-BANK-02 — Tratamento de indisponibilidade da API
- **Objetivo:** Garantir erro amigável em falha externa.
- **Dados de entrada:** `axios.get` rejeitando (mock) / chamada real a `GET /api/banks`.
- **Resultado esperado:** Erro *“Serviço de instituições financeiras indisponível no momento.”* (U) ou contrato válido 200/500 (I).
- **Resultado obtido:** Conforme esperado.
- **Status:** ✅ Aprovado · *(BrasilApiService.test.ts #2, server.integration.test.ts #3)*

### Transações (UC08–UC11)

#### TC-TRX-01 — Forçar tipo DESPESA em compra no cartão
- **Objetivo:** **Regra de negócio** — lançamento de cartão é sempre DESPESA.
- **Dados de entrada:** `{ type: "INCOME", creditCardId: 99, ... }`.
- **Resultado esperado:** Transação persistida com `type = "EXPENSE"`.
- **Resultado obtido:** `type = "EXPENSE"`.
- **Status:** ✅ Aprovado · *(TransactionService.test.ts #1)*

#### TC-TRX-02 — Não descontar saldo em compra no crédito
- **Objetivo:** **Regra de negócio** — compra no cartão não altera saldo da conta.
- **Dados de entrada:** `{ amount: 4500, creditCardId: 1, accountId: 1 }`.
- **Resultado esperado:** Saldo da conta inalterado (incremento 0).
- **Resultado obtido:** Conforme esperado.
- **Status:** ✅ Aprovado · *(TransactionService.test.ts #2)*

#### TC-TRX-03 — Criar transação válida (com efeito no saldo)
- **Objetivo:** Validar criação e persistência.
- **Pré-condições:** Usuário autenticado com conta e categoria.
- **Dados de entrada:** Despesa de R$ 150,50 em conta existente.
- **Passos:** 1) `POST /api/transactions`.
- **Resultado esperado:** HTTP 201; transação criada.
- **Resultado obtido:** HTTP 201.
- **Status:** ✅ Aprovado · *(transactions.integration.test.ts #1; transaction.cy.ts)*

#### TC-TRX-04 — Listar transações do usuário
- **Objetivo:** Validar listagem do extrato.
- **Passos:** 1) `GET /api/transactions`.
- **Resultado esperado:** HTTP 200; corpo é *array*.
- **Resultado obtido:** HTTP 200, *array*.
- **Status:** ✅ Aprovado · *(transactions.integration.test.ts #3)*

#### TC-TRX-05 — Atualizar valor da transação
- **Objetivo:** Validar edição.
- **Dados de entrada:** `{ amount: 240, ... }` para a transação criada.
- **Passos:** 1) `PUT /api/transactions/:id`.
- **Resultado esperado:** HTTP 200; `amount = 240`.
- **Resultado obtido:** HTTP 200, `amount = 240`.
- **Status:** ✅ Aprovado · *(transactions.integration.test.ts #4)*

#### TC-TRX-06 — Excluir transação inexistente
- **Objetivo:** Validar tratamento de inexistência.
- **Dados de entrada:** `deleteTransaction(999)`.
- **Resultado esperado:** Erro *“Transação não encontrada.”*.
- **Resultado obtido:** Erro lançado.
- **Status:** ✅ Aprovado · *(TransactionService.test.ts #3)*

#### TC-TRX-07 — Reverter saldo ao excluir receita
- **Objetivo:** **Regra de negócio** — estorno coerente do saldo.
- **Dados de entrada:** Transação RECEITA de R$ 100 (conta 1).
- **Resultado esperado:** `account.update` com `balance.increment = -100`.
- **Resultado obtido:** Conforme esperado.
- **Status:** ✅ Aprovado · *(TransactionService.test.ts #4)*

### Cartões de Crédito (UC12–UC14)

#### TC-CARD-01 — Cadastrar cartão de crédito
- **Objetivo:** Validar criação.
- **Dados de entrada:** `{ name: "Visa Platinum", limitAmount: 5000, closingDay: 10, dueDay: 15 }` + token.
- **Passos:** 1) `POST /api/credit-cards`.
- **Resultado esperado:** HTTP 200/201 com `id`.
- **Resultado obtido:** HTTP 201 com `id`.
- **Status:** ✅ Aprovado · *(CreditCardService.test.ts #1, creditCard.integration.test.ts #1; creditCard.cy.ts)*

#### TC-CARD-02 — Calcular fatura atual e limite disponível
- **Objetivo:** **Regra de negócio** — `fatura = Σ transações`; `disponível = limite − fatura`.
- **Dados de entrada:** Cartão com limite 5000 e transações de 150 + 350.
- **Resultado esperado:** `currentInvoice = 500`; `availableLimit = 4500`.
- **Resultado obtido:** `500` e `4500`.
- **Status:** ✅ Aprovado · *(CreditCardService.test.ts #2, creditCard.integration.test.ts #2)*

#### TC-CARD-03 — Bloquear exclusão de cartão com fatura
- **Objetivo:** **Regra de negócio** — proteger histórico.
- **Dados de entrada:** Cartão com 1 transação.
- **Resultado esperado:** Erro *“Não é possível excluir um cartão com faturas pendentes…”*; `delete` não chamado.
- **Resultado obtido:** Erro lançado.
- **Status:** ✅ Aprovado · *(CreditCardService.test.ts #4)*

#### TC-CARD-04 — Excluir cartão com fatura zerada
- **Objetivo:** Validar exclusão permitida.
- **Dados de entrada:** Cartão sem transações.
- **Resultado esperado:** `prisma.creditCard.delete` chamado com `{ where: { id: 2 } }`.
- **Resultado obtido:** Conforme esperado.
- **Status:** ✅ Aprovado · *(CreditCardService.test.ts #6)*

### Categorias (UC15)

#### TC-CAT-01 — Criar categoria personalizada (isDefault = false)
- **Objetivo:** Garantir que categorias do usuário nascem como não padrão.
- **Dados de entrada:** `{ name: "Lazer", type: "EXPENSE", color: "#FF0000" }`.
- **Resultado esperado:** `create` chamado com `isDefault: false`; HTTP 201 na integração.
- **Resultado obtido:** Conforme esperado.
- **Status:** ✅ Aprovado · *(CategoryService.test.ts #1, category.integration.test.ts #2; categories.cy.ts)*

#### TC-CAT-02 — Bloquear exclusão de categoria padrão
- **Objetivo:** **Regra de negócio** — categorias do sistema são imutáveis.
- **Dados de entrada:** Categoria com `isDefault = true`.
- **Resultado esperado:** Erro / HTTP 403 *“Categorias padrão não podem ser removidas.”*.
- **Resultado obtido:** Erro / HTTP 403.
- **Status:** ✅ Aprovado · *(CategoryService.test.ts #6, validation.integration.test.ts)*

#### TC-CAT-03 — Bloquear operação em categoria de outro usuário
- **Objetivo:** Validar isolamento por proprietário.
- **Dados de entrada:** `deleteCategory(5, 1)` / `PUT /api/categories/99999999`.
- **Resultado esperado:** Erro *“…não pertence a você.”* / HTTP 404.
- **Resultado obtido:** Conforme esperado.
- **Status:** ✅ Aprovado · *(CategoryService.test.ts #7, validation.integration.test.ts)*

### Metas Financeiras (UC16–UC17)

#### TC-META-01 — Calcular progresso (50%)
- **Objetivo:** Validar cálculo de percentual.
- **Dados de entrada:** Meta alvo 10000, atual 5000.
- **Resultado esperado:** `progressPercentage = 50`; `isCompleted = false`.
- **Resultado obtido:** `50` e `false`.
- **Status:** ✅ Aprovado · *(GoalService.test.ts #2)*

#### TC-META-02 — Marcar meta concluída (100%)
- **Objetivo:** Validar *status* de conclusão.
- **Dados de entrada:** Meta alvo 20000, atual 20000.
- **Resultado esperado:** `progressPercentage = 100`; `isCompleted = true`.
- **Resultado obtido:** `100` e `true`.
- **Status:** ✅ Aprovado · *(GoalService.test.ts #3)*

#### TC-META-03 — Criar meta exige campos obrigatórios / bloquear sem token
- **Objetivo:** Validar criação segura.
- **Dados de entrada:** `POST /api/goals` sem token → 401; com token e payload incompleto → 400.
- **Resultado esperado:** HTTP 401 (sem token) e HTTP 400 (incompleto).
- **Resultado obtido:** HTTP 401 e HTTP 400.
- **Status:** ✅ Aprovado · *(goals.integration.test.ts #1, validation.integration.test.ts)*

#### TC-META-04 — Registrar aporte atualizando valor atual
- **Objetivo:** Validar atualização do progresso.
- **Pré-condições:** Meta criada (alvo 50000).
- **Dados de entrada:** `{ currentAmount: 10000 }`.
- **Passos:** 1) `PUT /api/goals/:id`.
- **Resultado esperado:** HTTP 200; `currentAmount = 10000`.
- **Resultado obtido:** `currentAmount = 10000`.
- **Status:** ✅ Aprovado · *(goals.integration.test.ts #3, GoalService.test.ts #6; goals.cy.ts → 25% concluído)*

#### TC-META-05 — Bloquear aporte em meta de outro usuário / inexistente
- **Objetivo:** Validar isolamento e inexistência.
- **Dados de entrada:** `updateGoal(1, 99, ...)` / `PUT /api/goals/99999999`.
- **Resultado esperado:** Erro *“Meta não encontrada ou não pertence ao usuário.”* / HTTP 404.
- **Resultado obtido:** Conforme esperado.
- **Status:** ✅ Aprovado · *(GoalService.test.ts #5, validation.integration.test.ts)*

### Administração (UC18)

#### TC-ADMIN-01 — Criar administrador
- **Objetivo:** Validar criação de usuário com papel ADMIN.
- **Dados de entrada:** `{ name, email único, password, role: "ADMIN" }`.
- **Passos:** 1) `POST /api/users/register`.
- **Resultado esperado:** HTTP 201; `user.role = "ADMIN"`.
- **Resultado obtido:** HTTP 201, `role = "ADMIN"`.
- **Status:** ✅ Aprovado · *(UserService.test.ts #2, users.integration.test.ts #1)*

#### TC-ADMIN-02 — Listar usuários e editar papel
- **Objetivo:** Validar listagem e atualização de nível de acesso.
- **Passos:** 1) `GET /api/users`. 2) `PUT /api/users/:id` com `{ name, role }`.
- **Resultado esperado:** HTTP 200 na listagem (array) e na atualização.
- **Resultado obtido:** HTTP 200 em ambos.
- **Status:** ✅ Aprovado · *(users.integration.test.ts #3 e #4; users.cy.ts)*

#### TC-ADMIN-03 — Excluir usuário em cascata
- **Objetivo:** **Regra de negócio** — remover dependências (transações/contas) ao excluir.
- **Dados de entrada:** `deleteUser(42)` / `DELETE /api/users/:id`.
- **Resultado esperado:** `transaction.deleteMany`, `account.deleteMany` e `user.delete` chamados; HTTP 200.
- **Resultado obtido:** Conforme esperado.
- **Status:** ✅ Aprovado · *(UserService.test.ts #3, users.integration.test.ts #5)*

---

## 4. Resumo de Execução

| Nível | Suítes | Testes | Status |
| ----- | ------ | ------ | ------ |
| Unitário back-end (Jest, mock Prisma) | 7 | 39 | ✅ 100% |
| Unitário front-end (Vitest + Testing Library) | 5 | 39 | ✅ 100% |
| Integração (Jest + Supertest + SQLite local) | 8 | 41 | ✅ 100% |
| **Subtotal automatizado** | **20** | **119** | ✅ **100%** |
| End-to-End (Cypress) | 5 specs | 5 fluxos | ✅ |

> Reprodução: `npm run test:coverage` (unit + integração com relatório de cobertura) e
> `npm run test:e2e` (Cypress). Detalhes em [04-ESTRATEGIA-E-RELATORIO-DE-TESTES.md](./04-ESTRATEGIA-E-RELATORIO-DE-TESTES.md).
