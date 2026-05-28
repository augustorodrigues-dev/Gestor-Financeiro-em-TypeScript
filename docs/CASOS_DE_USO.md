# 📋 Documentação de Casos de Uso — FinanceFlow

> Sistema de gestão financeira pessoal full stack (React + Express + Prisma + PostgreSQL),
> com autenticação JWT, controle de acesso por papéis e integração com a Brasil API.

## Atores

| Ator | Descrição |
|------|-----------|
| **Usuário (USER)** | Pessoa autenticada que gerencia suas contas, transações e saldo. |
| **Administrador (ADMIN)** | Usuário com privilégios de gestão de todos os usuários do sistema. |
| **Sistema** | Regras automáticas (cálculo de saldo, geração de token, validações). |
| **Brasil API** (externo) | Serviço externo que fornece a lista de instituições financeiras. |

## Visão geral / Rastreabilidade

| UC | Nome | Ator | Implementação | Cobertura de teste |
|----|------|------|---------------|--------------------|
| UC01 | Autenticar (login) | Usuário/Admin | `UserController.login` | `UserController.test.ts`, `users.integration`, `E2E-03/04` |
| UC02 | Cadastrar usuário | Visitante | `UserController.create` | `UserController.test.ts`, `users.integration`, `Register.test.tsx` |
| UC03 | Encerrar sessão (logout) | Usuário/Admin | `App.handleLogout` | `App.test.tsx` |
| UC04 | Visualizar saldo consolidado | Usuário | `Dashboard` / `/api/balance` | `Dashboard.test.tsx`, `E2E-03` |
| UC05 | Visualizar extrato | Usuário | `TransactionService.getTransactionsByUser` | `TransactionService.test.ts`, `transactions.integration` |
| UC06 | Registrar transação | Usuário | `TransactionController.create` | unit + `transactions.integration`, `Dashboard.test.tsx` |
| UC07 | Editar transação | Usuário | `TransactionController.update` | unit + integration + `Dashboard.test.tsx` |
| UC08 | Excluir transação | Usuário | `TransactionController.delete` | unit + integration + `Dashboard.test.tsx` |
| UC09 | Criar/Vincular conta | Usuário | `AccountController.create` | unit + `accounts.integration`, `AccountManager.test.tsx` |
| UC10 | Listar contas | Usuário | `AccountService.getAccountsByUser` | unit + integration + `AccountManager.test.tsx` |
| UC11 | Editar conta | Usuário | `AccountController.update` | unit + `accounts.integration` |
| UC12 | Excluir conta (com trava) | Usuário | `AccountService.deleteAccount` | unit + `accounts.integration` |
| UC13 | Consultar bancos (Brasil API) | Sistema | `brasilApiService.getBanks` | `brasilApiService.test.ts` |
| UC14 | Gerenciar usuários (listar/editar) | Admin | `UserController.listAll/update` | unit + `users.integration`, `AdminPanel.test.tsx` |
| UC15 | Criar admin / Excluir usuário | Admin | `UserController.create/delete` | unit + `users.integration`, `AdminPanel.test.tsx` |

---

## UC01 — Autenticar (login)
- **Ator:** Usuário/Administrador
- **Pré-condição:** Usuário cadastrado no sistema.
- **Fluxo principal:**
  1. O ator informa e-mail e senha.
  2. O sistema valida os campos obrigatórios.
  3. O sistema busca o usuário pelo e-mail e compara a senha (bcrypt).
  4. O sistema gera um token JWT (validade de 1 dia) e retorna os dados do usuário.
- **Fluxos alternativos:**
  - 2a. Campos ausentes → HTTP 400.
  - 3a. Usuário inexistente ou senha incorreta → HTTP 401.
- **Pós-condição:** Sessão iniciada; token armazenado no `localStorage`.

## UC02 — Cadastrar usuário
- **Ator:** Visitante
- **Pré-condição:** E-mail ainda não cadastrado.
- **Fluxo principal:**
  1. O ator informa nome, e-mail e senha.
  2. O sistema valida campos e verifica unicidade do e-mail.
  3. A senha é criptografada (bcrypt) e o usuário é persistido.
  4. O sistema gera um token JWT para início de sessão automático.
- **Fluxos alternativos:**
  - 2a. Campos ausentes → HTTP 400.
  - 2b. E-mail já cadastrado → HTTP 400 com mensagem específica.
- **Pós-condição:** Usuário criado e autenticado.

## UC03 — Encerrar sessão (logout)
- **Ator:** Usuário/Administrador
- **Pré-condição:** Sessão ativa.
- **Fluxo principal:** O ator clica em "Sair"; o token é removido do `localStorage` e a aplicação retorna à tela de login.
- **Pós-condição:** Sessão encerrada.

## UC04 — Visualizar saldo consolidado
- **Ator:** Usuário
- **Pré-condição:** Usuário autenticado.
- **Fluxo principal:** O sistema soma o saldo de todas as contas do usuário e exibe o valor formatado em BRL, com cor verde (positivo) ou vermelha (negativo).
- **Pós-condição:** Saldo apresentado no Dashboard.

## UC05 — Visualizar extrato de transações
- **Ator:** Usuário
- **Pré-condição:** Usuário autenticado.
- **Fluxo principal:** O sistema lista as transações das contas do usuário, ordenadas por data (desc), exibindo descrição, conta, data e valor.
- **Fluxo alternativo:** Sem transações → mensagem de estado vazio.

## UC06 — Registrar transação (receita/despesa)
- **Ator:** Usuário
- **Pré-condição:** Existir ao menos uma conta vinculada.
- **Fluxo principal:**
  1. O ator informa descrição, valor, tipo (INCOME/EXPENSE), conta e data.
  2. O sistema valida os campos obrigatórios.
  3. O sistema cria a transação e atualiza o saldo da conta de forma atômica (`prisma.$transaction`).
- **Fluxo alternativo:** 2a. Campos ausentes → HTTP 400.
- **Pós-condição:** Transação registrada e saldo recalculado.

## UC07 — Editar transação
- **Ator:** Usuário
- **Pré-condição:** Transação existente.
- **Fluxo principal:** O ator seleciona uma transação, altera os dados e confirma; o sistema persiste a atualização.
- **Fluxo alternativo:** ID inválido → HTTP 400.

## UC08 — Excluir transação
- **Ator:** Usuário
- **Pré-condição:** Transação existente.
- **Fluxo principal:** O ator confirma a exclusão; o sistema remove a transação e recarrega o extrato.
- **Fluxo alternativo:** ID inválido → HTTP 400.

## UC09 — Criar/Vincular conta bancária
- **Ator:** Usuário
- **Pré-condição:** Usuário autenticado.
- **Fluxo principal:**
  1. O ator escolhe uma instituição (lista da Brasil API) e o tipo da conta.
  2. O sistema valida nome e tipo e cria a conta vinculada ao usuário do token JWT.
- **Fluxo alternativo:** 2a. Nome/tipo ausentes → HTTP 400.

## UC10 — Listar contas do usuário
- **Ator:** Usuário
- **Fluxo principal:** O sistema retorna as contas do usuário (ordenadas por nome) com a contagem de transações vinculadas.

## UC11 — Editar conta
- **Ator:** Usuário
- **Pré-condição:** A conta pertence ao usuário autenticado.
- **Fluxo principal:** O ator altera nome/tipo e confirma; o sistema valida a propriedade e persiste.
- **Fluxo alternativo:** Conta inexistente/sem permissão → erro "Conta não encontrada ou acesso negado".

## UC12 — Excluir conta (com regra de bloqueio)
- **Ator:** Usuário
- **Pré-condição:** A conta pertence ao usuário.
- **Fluxo principal:** O sistema verifica se a conta possui transações; não havendo, exclui a conta.
- **Fluxo alternativo:** Conta com transações vinculadas → exclusão bloqueada (mensagem de regra de negócio).

## UC13 — Consultar instituições financeiras (Brasil API)
- **Ator:** Sistema (integração externa)
- **Fluxo principal:** O sistema consulta `https://brasilapi.com.br/api/banks/v1`, filtra bancos válidos (code + name) e retorna até 20 itens.
- **Fluxo alternativo:** Falha da API externa → erro amigável "Serviço de instituições financeiras indisponível".

## UC14 — Gerenciar usuários (Admin)
- **Ator:** Administrador
- **Pré-condição:** Sessão de administrador.
- **Fluxo principal:** O admin lista os usuários com seus níveis de acesso e pode editar nome e papel (USER/ADMIN).
- **Fluxo alternativo:** Nome/role ausentes na edição → HTTP 400.

## UC15 — Criar administrador / Excluir usuário (Admin)
- **Ator:** Administrador
- **Pré-condição:** Sessão de administrador.
- **Fluxo principal:** O admin cadastra um novo administrador ou remove um usuário (exclusão em cascata de contas e transações).
- **Fluxo alternativo:** Tentativa de excluir a administradora principal é bloqueada na interface.
