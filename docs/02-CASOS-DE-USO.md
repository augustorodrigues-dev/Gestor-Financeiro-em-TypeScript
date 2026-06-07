# FinanceFlow 💸 — Documentação dos Casos de Uso

> Documento 02 de 05. Veja o [índice da documentação](./README.md).
> São **18 casos de uso** (mínimo exigido: 15), cobrindo operações básicas de CRUD e
> regras de negócio elaboradas. Cada caso segue o padrão: **Ator, Pré-condições,
> Fluxo Principal, Fluxos Alternativos/Exceção e Pós-condições.**

## Atores do Sistema

| Ator | Descrição |
| ---- | --------- |
| **Visitante** | Pessoa não autenticada (pode apenas cadastrar-se ou autenticar-se). |
| **Usuário** | Pessoa autenticada com papel `USER`. Gerencia suas próprias finanças. |
| **Administrador** | Pessoa autenticada com papel `ADMIN`. Gerencia usuários e papéis. |
| **Sistema FinanceFlow** | Executa regras automáticas (cálculo de saldo, fatura, progresso). |
| **Brasil API** | Sistema externo que fornece o catálogo de instituições financeiras. |

## Índice dos Casos de Uso

| ID | Caso de Uso | Módulo |
| -- | ----------- | ------ |
| UC01 | Cadastrar-se na plataforma | Autenticação |
| UC02 | Autenticar-se (Login) | Autenticação |
| UC03 | Encerrar sessão (Logout) | Autenticação |
| UC04 | Cadastrar conta bancária (com Brasil API) | Contas |
| UC05 | Listar contas e saldo consolidado | Contas |
| UC06 | Editar conta bancária | Contas |
| UC07 | Excluir conta bancária | Contas |
| UC08 | Registrar transação (receita/despesa) | Transações |
| UC09 | Listar extrato de transações | Transações |
| UC10 | Editar transação | Transações |
| UC11 | Excluir transação (reversão de saldo) | Transações |
| UC12 | Cadastrar cartão de crédito | Cartões |
| UC13 | Acompanhar fatura e limite disponível | Cartões |
| UC14 | Excluir cartão de crédito | Cartões |
| UC15 | Gerenciar categorias personalizadas | Categorias |
| UC16 | Criar e acompanhar metas financeiras | Metas |
| UC17 | Registrar aporte em meta | Metas |
| UC18 | Administrar usuários e papéis de acesso | Administração |

---

## UC01 — Cadastrar-se na plataforma

- **Ator principal:** Visitante
- **Pré-condições:** O visitante não possui conta com o e-mail informado.
- **Fluxo principal:**
  1. O visitante acessa a tela de **Cadastro**.
  2. Informa nome, e-mail e senha e confirma.
  3. O sistema valida os campos obrigatórios.
  4. O sistema verifica que o e-mail ainda não está cadastrado.
  5. O sistema gera o *hash* da senha (Bcrypt) e persiste o usuário com papel `USER`.
  6. O sistema gera um token JWT e inicia a sessão automaticamente.
- **Fluxos alternativos / exceção:**
  - **A1 (campos faltando):** o sistema retorna HTTP 400 e a mensagem *“Nome, e-mail e senha são obrigatórios.”*.
  - **A2 (e-mail duplicado):** o sistema retorna HTTP 400 e *“Este e-mail já está cadastrado no sistema.”*.
- **Pós-condições:** Novo usuário persistido; sessão iniciada (token válido por 1 dia).
- **Implementação:** `POST /api/users/register` → `UserController.create` → `UserService.createUser`.

## UC02 — Autenticar-se (Login)

- **Ator principal:** Visitante (com conta)
- **Pré-condições:** Usuário previamente cadastrado.
- **Fluxo principal:**
  1. O visitante acessa a tela de **Login** e informa e-mail e senha.
  2. O sistema busca o usuário pelo e-mail.
  3. O sistema compara a senha informada com o *hash* armazenado (Bcrypt).
  4. Sendo válida, o sistema gera o token JWT e devolve os dados do usuário (id, nome, papel).
  5. O front-end armazena o token e redireciona conforme o papel (USER → Dashboard, ADMIN → Painel).
- **Fluxos alternativos / exceção:**
  - **A1 (campos faltando):** HTTP 400 *“E-mail e senha são obrigatórios.”*.
  - **A2 (e-mail inexistente ou senha incorreta):** HTTP 401 *“E-mail ou senha inválidos.”*.
- **Pós-condições:** Sessão autenticada; token JWT disponível para rotas protegidas.
- **Implementação:** `POST /api/users/login` → `UserController.login`.

## UC03 — Encerrar sessão (Logout)

- **Ator principal:** Usuário / Administrador
- **Pré-condições:** Sessão ativa.
- **Fluxo principal:**
  1. O usuário aciona **Sair**.
  2. O front-end remove o token do `localStorage` e limpa o estado de sessão.
  3. O sistema redireciona para a tela de Login.
- **Fluxos alternativos:** Não há.
- **Pós-condições:** Sessão encerrada; rotas protegidas tornam-se inacessíveis.
- **Implementação:** `App.tsx` → `handleLogout`.

## UC04 — Cadastrar conta bancária (com Brasil API)

- **Ator principal:** Usuário · **Ator de apoio:** Brasil API
- **Pré-condições:** Usuário autenticado.
- **Fluxo principal:**
  1. O usuário acessa **Carteira**.
  2. O sistema consulta a **Brasil API** e exibe a lista de instituições financeiras reais.
  3. O usuário seleciona a instituição e o tipo de conta (Corrente/Poupança/Carteira).
  4. O sistema persiste a nova conta vinculada ao usuário (saldo inicial 0 por padrão).
- **Fluxos alternativos / exceção:**
  - **A1 (Brasil API indisponível):** o sistema exibe a opção *“Carteira Física”* e segue funcionando.
  - **A2 (campos obrigatórios ausentes):** HTTP 400 *“Nome e tipo da conta são obrigatórios.”*.
  - **A3 (sem token):** HTTP 401 *“Token não fornecido. Acesso negado.”*.
- **Pós-condições:** Conta criada e disponível para receber transações.
- **Implementação:** `GET /api/banks` + `POST /api/accounts` → `AccountController.create` → `AccountService.createAccount`.

## UC05 — Listar contas e saldo consolidado

- **Ator principal:** Usuário · **Ator de apoio:** Sistema FinanceFlow
- **Pré-condições:** Usuário autenticado.
- **Fluxo principal:**
  1. O usuário acessa o **Dashboard**.
  2. O sistema lista as contas do usuário com a contagem de transações vinculadas.
  3. O sistema calcula e exibe o **saldo consolidado** (soma dos saldos das contas).
- **Fluxos alternativos / exceção:**
  - **A1 (ID inválido na consulta de saldo):** HTTP 400 *“ID de usuário inválido.”*.
- **Pós-condições:** Saldo e contas exibidos; nenhum dado é alterado.
- **Implementação:** `GET /api/accounts` + `GET /api/balance/user/:userId`.

## UC06 — Editar conta bancária

- **Ator principal:** Usuário
- **Pré-condições:** Usuário autenticado; conta pertence ao usuário.
- **Fluxo principal:**
  1. O usuário seleciona uma conta e altera nome e/ou tipo.
  2. O sistema confirma que a conta pertence ao usuário.
  3. O sistema persiste as alterações.
- **Fluxos alternativos / exceção:**
  - **A1 (conta de outro usuário / inexistente):** *“Conta não encontrada ou acesso negado.”*.
  - **A2 (ID inválido):** HTTP 400 *“ID da conta inválido.”*.
- **Pós-condições:** Conta atualizada.
- **Implementação:** `PUT /api/accounts/:id` → `AccountService.updateAccount`.

## UC07 — Excluir conta bancária

- **Ator principal:** Usuário
- **Pré-condições:** Usuário autenticado; conta pertence ao usuário.
- **Fluxo principal:**
  1. O usuário solicita a exclusão de uma conta.
  2. O sistema verifica se há transações vinculadas.
  3. Não havendo, exclui a conta.
- **Fluxos alternativos / exceção:**
  - **A1 (conta com transações):** **regra de negócio** — bloqueio com *“Exclusão bloqueada: Esta conta possui transações vinculadas. Exclua as transações primeiro.”*.
  - **A2 (conta inexistente):** *“Conta não encontrada.”*.
- **Pós-condições:** Conta removida apenas quando sem transações.
- **Implementação:** `DELETE /api/accounts/:id` → `AccountService.deleteAccount`.

## UC08 — Registrar transação (receita/despesa)

- **Ator principal:** Usuário · **Ator de apoio:** Sistema FinanceFlow
- **Pré-condições:** Usuário autenticado; existe ao menos uma conta e uma categoria.
- **Fluxo principal:**
  1. O usuário informa descrição, valor, tipo (RECEITA/DESPESA), conta, categoria e data.
  2. O sistema persiste a transação.
  3. **Regra de negócio:** o sistema atualiza o saldo da conta (RECEITA soma; DESPESA subtrai), de forma atômica (transação de banco).
- **Fluxos alternativos / exceção:**
  - **A1 (campos obrigatórios ausentes):** HTTP 400 *“Todos os campos obrigatórios devem ser preenchidos.”*.
  - **A2 (lançamento no cartão de crédito):** o tipo é forçado para DESPESA e o **saldo da conta não é alterado** (o valor compõe a fatura do cartão).
- **Pós-condições:** Transação persistida; saldo da conta recalculado.
- **Implementação:** `POST /api/transactions` → `TransactionService.createTransaction`.

## UC09 — Listar extrato de transações

- **Ator principal:** Usuário
- **Pré-condições:** Usuário autenticado.
- **Fluxo principal:**
  1. O usuário acessa o **Dashboard**.
  2. O sistema lista as transações do usuário ordenadas por data (mais recentes primeiro), com conta, categoria e cartão associados.
- **Fluxos alternativos:** Lista vazia → mensagem de extrato vazio.
- **Pós-condições:** Extrato exibido; nenhum dado alterado.
- **Implementação:** `GET /api/transactions` → `TransactionService.getTransactionsByUser`.

## UC10 — Editar transação

- **Ator principal:** Usuário
- **Pré-condições:** Usuário autenticado; transação existente.
- **Fluxo principal:**
  1. O usuário altera dados de uma transação (descrição, valor, conta, data).
  2. O sistema persiste as alterações.
- **Fluxos alternativos / exceção:** erro de persistência → HTTP 500 com mensagem.
- **Pós-condições:** Transação atualizada.
- **Implementação:** `PUT /api/transactions/:id` → `TransactionService.updateTransaction`.

## UC11 — Excluir transação (reversão de saldo)

- **Ator principal:** Usuário · **Ator de apoio:** Sistema FinanceFlow
- **Pré-condições:** Usuário autenticado; transação existente.
- **Fluxo principal:**
  1. O usuário solicita a exclusão de uma transação.
  2. **Regra de negócio:** o sistema **reverte** o efeito no saldo (estorna RECEITA, devolve DESPESA) de forma atômica e remove a transação.
- **Fluxos alternativos / exceção:**
  - **A1 (transação inexistente):** HTTP 400 *“Transação não encontrada.”*.
  - **A2 (transação de cartão):** o saldo da conta **não** é alterado na reversão.
- **Pós-condições:** Transação removida; saldo recalculado coerentemente.
- **Implementação:** `DELETE /api/transactions/:id` → `TransactionService.deleteTransaction`.

## UC12 — Cadastrar cartão de crédito

- **Ator principal:** Usuário
- **Pré-condições:** Usuário autenticado.
- **Fluxo principal:**
  1. O usuário informa apelido, limite, dia de fechamento e dia de vencimento.
  2. O sistema persiste o cartão vinculado ao usuário.
- **Fluxos alternativos / exceção:** **A1 (campos ausentes):** HTTP 400 *“Todos os campos são obrigatórios.”*.
- **Pós-condições:** Cartão criado, disponível para lançamentos.
- **Implementação:** `POST /api/credit-cards` → `CreditCardService.createCard`.

## UC13 — Acompanhar fatura e limite disponível

- **Ator principal:** Usuário · **Ator de apoio:** Sistema FinanceFlow
- **Pré-condições:** Usuário autenticado; ao menos um cartão cadastrado.
- **Fluxo principal:**
  1. O usuário acessa **Gestão de Cartões**.
  2. **Regra de negócio:** para cada cartão, o sistema calcula a **fatura atual**
     (soma das transações do cartão) e o **limite disponível** (limite − fatura),
     exibindo a barra de utilização.
- **Fluxos alternativos:** Cartão sem transações → fatura 0 e limite integral.
- **Pós-condições:** Indicadores financeiros exibidos; nenhum dado alterado.
- **Implementação:** `GET /api/credit-cards` → `CreditCardService.getCardsByUser`.

## UC14 — Excluir cartão de crédito

- **Ator principal:** Usuário
- **Pré-condições:** Usuário autenticado; cartão existente.
- **Fluxo principal:**
  1. O usuário solicita a exclusão de um cartão.
  2. O sistema verifica se há transações/faturas vinculadas.
  3. Não havendo, exclui o cartão.
- **Fluxos alternativos / exceção:**
  - **A1 (cartão com fatura/histórico):** **regra de negócio** — bloqueio com *“Não é possível excluir um cartão com faturas pendentes ou histórico ativo.”*.
  - **A2 (cartão inexistente):** *“Cartão não encontrado.”*.
- **Pós-condições:** Cartão removido apenas quando sem histórico.
- **Implementação:** `DELETE /api/credit-cards/:id` → `CreditCardService.deleteCard`.

## UC15 — Gerenciar categorias personalizadas

- **Ator principal:** Usuário
- **Pré-condições:** Usuário autenticado.
- **Fluxo principal:**
  1. O usuário cria uma categoria (nome, tipo, cor), que nasce como **não padrão** (`isDefault = false`).
  2. O sistema lista as categorias **padrão do sistema + personalizadas** do usuário.
  3. O usuário pode excluir as próprias categorias personalizadas.
- **Fluxos alternativos / exceção:**
  - **A1 (campos ausentes):** HTTP 400 *“Nome e tipo da categoria são obrigatórios.”*.
  - **A2 (excluir categoria padrão):** **regra de negócio** — HTTP 403 *“Categorias padrão não podem ser removidas.”*.
  - **A3 (categoria de outro usuário):** HTTP 404 *“Categoria não encontrada ou não pertence a você.”*.
- **Pós-condições:** Categorias atualizadas conforme a operação.
- **Implementação:** `POST/GET/PUT/DELETE /api/categories` → `CategoryService`.

## UC16 — Criar e acompanhar metas financeiras

- **Ator principal:** Usuário · **Ator de apoio:** Sistema FinanceFlow
- **Pré-condições:** Usuário autenticado.
- **Fluxo principal:**
  1. O usuário cria uma meta (nome, valor-alvo, prazo).
  2. **Regra de negócio:** o sistema calcula o **percentual de progresso**
     (valor atual ÷ valor-alvo) e o *status* `isCompleted` (atingiu o alvo?).
  3. As metas são exibidas com barra de progresso no Dashboard e na tela de Metas.
- **Fluxos alternativos / exceção:**
  - **A1 (campos ausentes):** HTTP 400 *“Nome, valor alvo e prazo são obrigatórios.”*.
  - **A2 (valor-alvo 0):** o progresso é tratado como 0% (evita divisão por zero).
- **Pós-condições:** Meta criada e exibida com indicadores.
- **Implementação:** `POST/GET /api/goals` → `GoalService.createGoal` / `getGoalsByUser`.

## UC17 — Registrar aporte em meta

- **Ator principal:** Usuário · **Ator de apoio:** Sistema FinanceFlow
- **Pré-condições:** Usuário autenticado; meta existente e pertencente ao usuário.
- **Fluxo principal:**
  1. O usuário informa o valor do aporte.
  2. O sistema soma o aporte ao valor atual da meta e persiste.
  3. O sistema recalcula o progresso; ao atingir 100%, marca a meta como concluída.
- **Fluxos alternativos / exceção:**
  - **A1 (meta inexistente / de outro usuário):** HTTP 404 *“Meta não encontrada ou não pertence ao usuário.”*.
- **Pós-condições:** Valor atual e progresso da meta atualizados.
- **Implementação:** `PUT /api/goals/:id` → `GoalService.updateGoal`.

## UC18 — Administrar usuários e papéis de acesso

- **Ator principal:** Administrador
- **Pré-condições:** Usuário autenticado com papel `ADMIN`.
- **Fluxo principal:**
  1. O administrador acessa o **Painel Administrativo**.
  2. O sistema lista todos os usuários com seus papéis.
  3. O administrador pode **criar** um novo administrador, **editar** nome/papel de um usuário e **excluir** um usuário.
  4. **Regra de negócio:** a exclusão de um usuário remove em cascata suas contas e transações.
- **Fluxos alternativos / exceção:**
  - **A1 (campos ausentes na edição):** HTTP 400 *“Nome e Role são obrigatórios.”*.
  - **A2 (e-mail duplicado ao criar admin):** HTTP 400 *“Este e-mail já está cadastrado no sistema.”*.
  - **A3 (tentativa de excluir a administradora principal):** bloqueio na interface.
- **Pós-condições:** Base de usuários atualizada conforme a operação.
- **Implementação:** `GET/POST/PUT/DELETE /api/users` → `UserController` / `UserService`.
